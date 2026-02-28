import initSqlJs from 'sql.js';
import { MemoryWiki, Chat, Message } from '../types';

// Define the shape of our DB Service
class DatabaseService {
  private db: any = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    try {
      // Manually fetch WASM binary to avoid fs.readFileSync errors
      const wasmUrl = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.11.0/sql-wasm.wasm';
      const response = await fetch(wasmUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch WASM: ${response.statusText}`);
      }

      const wasmBinary = await response.arrayBuffer();

      // Initialize SQL.js with the binary
      const SQL = await initSqlJs({
        wasmBinary,
      });

      // Check if we have a saved DB in localStorage to persist data across reloads
      const savedDb = localStorage.getItem('rbz_sqlite_db');

      if (savedDb) {
        const uInt8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uInt8Array);
      } else {
        this.db = new SQL.Database();
        this.createTables();
        this.seedData();
      }

      // Ensure tables exist even if loading from older DB version
      this.createTables();

      // Migration: Add secondary_agents column if it doesn't exist
      try {
        this.db.run("ALTER TABLE chats ADD COLUMN secondary_agents TEXT");
      } catch (e) { /* Column likely exists */ }

      // Migration: Add pending_actions column if it doesn't exist
      try {
        this.db.run("ALTER TABLE chats ADD COLUMN pending_actions TEXT");
      } catch (e) { /* Column likely exists */ }

      // Migration: Add disappearing_duration column if it doesn't exist
      try {
        this.db.run("ALTER TABLE chats ADD COLUMN disappearing_duration INTEGER DEFAULT 0");
      } catch (e) { /* Column likely exists */ }

      // Migration: Add author_json to messages if it doesn't exist
      try {
        this.db.run("ALTER TABLE messages ADD COLUMN author_json TEXT");
      } catch (e) { /* Column likely exists */ }

      // Migration: Add avatar_svg to agents if it doesn't exist
      try {
        this.db.run("ALTER TABLE agents ADD COLUMN avatar_svg TEXT");
      } catch (e) { /* Column likely exists */ }

      this.isInitialized = true;
      console.log("SQLite Database Initialized");

      // Run cleanup for expired messages on init
      this.cleanupExpiredMessages();

      this.save(); // Initial save
    } catch (error) {
      console.error("Failed to initialize SQLite:", error);
    }
  }

  private createTables() {
    // Table: Agents (Stores static 'Soul' configuration + Generated Avatar)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT,
        soul_content TEXT,
        created_at TEXT,
        avatar_svg TEXT
      );
    `);

    // Table: Skills (Stores 'Skills.md' content and installation status)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        agent_id TEXT,
        name TEXT,
        description TEXT,
        content TEXT,
        is_installed INTEGER DEFAULT 0,
        author TEXT,
        version TEXT
      );
    `);

    // Table: Memories (Stores short-term interaction history)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_id TEXT,
        content TEXT,
        timestamp TEXT,
        type TEXT
      );
    `);

    // Table: Wiki Memories (Stores Long-Term Structured Memory Files)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS wiki_memories (
        id TEXT PRIMARY KEY,
        agent_id TEXT,
        title TEXT,
        tags TEXT, -- JSON string of tags
        summary TEXT,
        html_content TEXT,
        timestamp TEXT
      );
    `);

    // Table: Chats (Persistent Chat Sessions)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          agent_id TEXT,
          title TEXT,
          contact_name TEXT,
          avatar TEXT,
          unread_count INTEGER,
          last_active TEXT,
          is_agent INTEGER,
          secondary_agents TEXT,
          pending_actions TEXT,
          disappearing_duration INTEGER DEFAULT 0
      );
    `);

    // Table: Messages (Chat History + Files)
    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          chat_id TEXT,
          sender TEXT,
          text TEXT,
          timestamp TEXT,
          is_voice INTEGER,
          voice_duration TEXT,
          is_report INTEGER,
          image TEXT, -- Base64 encoded file/image content
          author_json TEXT, -- JSON for subAgentProfile
          FOREIGN KEY(chat_id) REFERENCES chats(id)
      );
    `);
  }

  private seedData() {
    // Seed some initial skills
    const stmt = this.db.prepare("INSERT INTO skills (id, agent_id, name, description, content, is_installed, author, version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

    // Core Skills
    stmt.run(['skill_core_1', 'global', 'Report Generation', 'Standard reporting capability', '## Report Generation logic...', 1, 'System', '1.0']);
    stmt.run(['skill_core_2', 'global', 'Summarization', 'Conversation summary', '## Summarization logic...', 1, 'System', '1.0']);

    // Python Coder (matches MarketplaceView mock)
    stmt.run(['pkg_2', 'global', 'Python Coder', 'Enhanced Python snippet generation', '## Python Coding Standards...', 1, 'DevTeam', '2.1.5']);

    stmt.free();
  }

  // --- Persistence ---
  public save() {
    if (!this.db) return;
    try {
      const data = this.db.export();
      localStorage.setItem('rbz_sqlite_db', JSON.stringify(Array.from(data)));
    } catch (e) {
      console.warn("Database too large for localStorage. Persistence might fail for large files.", e);
    }
  }

  public cleanupExpiredMessages() {
    if (!this.db) return;
    try {
      // Get all chats with active timer
      const chatsRes = this.db.exec(`SELECT id, disappearing_duration FROM chats WHERE disappearing_duration > 0`);
      if (chatsRes.length === 0) return;

      const chats = chatsRes[0].values;
      const now = new Date().getTime();

      chats.forEach((c: any[]) => {
        const chatId = c[0];
        const durationSec = c[1];

        // Calculate cutoff time: messages older than this are deleted
        // duration is in seconds, timestamp is ISO string
        const cutoffTime = new Date(now - (durationSec * 1000)).toISOString();

        this.db.run(`DELETE FROM messages WHERE chat_id = ? AND timestamp < ?`, [chatId, cutoffTime]);
      });

      console.log("Cleaned up expired messages");
      this.save();
    } catch (e) {
      console.error("Cleanup failed", e);
    }
  }

  // --- Chat Persistence Methods ---

  public saveChat(chat: Chat) {
    if (!this.db) return;

    // Upsert Chat
    this.db.run(`
        INSERT INTO chats (id, agent_id, title, contact_name, avatar, unread_count, last_active, is_agent, secondary_agents, pending_actions, disappearing_duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET 
            title = excluded.title,
            unread_count = excluded.unread_count,
            last_active = excluded.last_active,
            secondary_agents = excluded.secondary_agents,
            pending_actions = excluded.pending_actions,
            contact_name = excluded.contact_name,
            disappearing_duration = excluded.disappearing_duration,
            avatar = excluded.avatar
    `, [
      chat.id,
      chat.agentId,
      chat.title,
      chat.contactName,
      chat.avatar,
      chat.unreadCount,
      chat.lastActive.toISOString(),
      chat.isAgent ? 1 : 0,
      JSON.stringify(chat.secondaryAgents || []),
      JSON.stringify(chat.pendingActions || []),
      chat.disappearingDuration || 0
    ]);

    this.save();
  }

  public saveMessage(chatId: string, message: Message) {
    if (!this.db) return;

    // Insert Message
    this.db.run(`
        INSERT INTO messages (id, chat_id, sender, text, timestamp, is_voice, voice_duration, is_report, image, author_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET text = excluded.text
    `, [
      message.id,
      chatId,
      message.sender,
      message.text,
      message.timestamp.toISOString(),
      message.isVoice ? 1 : 0,
      message.voiceDuration || '',
      message.isReport ? 1 : 0,
      message.image || '',
      message.subAgentProfile ? JSON.stringify(message.subAgentProfile) : null
    ]);

    // Update chat timestamp
    this.db.run(`UPDATE chats SET last_active = ? WHERE id = ?`, [message.timestamp.toISOString(), chatId]);

    this.save();
  }

  public deleteChat(chatId: string) {
    if (!this.db) return;

    // Delete messages first
    this.db.run(`DELETE FROM messages WHERE chat_id = ?`, [chatId]);

    // Delete chat
    this.db.run(`DELETE FROM chats WHERE id = ?`, [chatId]);

    this.save();
  }

  public getChats(): Chat[] {
    if (!this.db) return [];

    // Run a quick cleanup before fetching
    this.cleanupExpiredMessages();

    try {
      const chatsRes = this.db.exec(`SELECT * FROM chats ORDER BY last_active DESC`);
      if (chatsRes.length === 0) return [];

      const columns = chatsRes[0].columns;
      const hasSecondaryAgents = columns.includes('secondary_agents');
      const secondaryAgentsIdx = columns.indexOf('secondary_agents');
      const hasPendingActions = columns.includes('pending_actions');
      const pendingActionsIdx = columns.indexOf('pending_actions');
      const disappearingIdx = columns.indexOf('disappearing_duration');

      const chats: Chat[] = chatsRes[0].values.map((c: any[]) => ({
        id: c[0],
        agentId: c[1],
        title: c[2],
        contactName: c[3],
        avatar: c[4],
        unreadCount: c[5],
        lastActive: new Date(c[6]),
        isAgent: c[7] === 1,
        secondaryAgents: (hasSecondaryAgents && c[secondaryAgentsIdx]) ? JSON.parse(c[secondaryAgentsIdx]) : [],
        pendingActions: (hasPendingActions && c[pendingActionsIdx]) ? JSON.parse(c[pendingActionsIdx]) : [],
        disappearingDuration: (disappearingIdx > -1) ? c[disappearingIdx] : 0,
        messages: []
      }));

      // Populate messages for each chat
      for (const chat of chats) {
        const msgRes = this.db.exec(`SELECT * FROM messages WHERE chat_id = '${chat.id}' ORDER BY timestamp ASC`);
        if (msgRes.length > 0) {
          const msgCols = msgRes[0].columns;
          const authorJsonIdx = msgCols.indexOf('author_json');

          chat.messages = msgRes[0].values.map((m: any[]) => ({
            id: m[0],
            // chat_id is m[1]
            sender: m[2],
            text: m[3],
            timestamp: new Date(m[4]),
            isVoice: m[5] === 1,
            voiceDuration: m[6] || undefined,
            isReport: m[7] === 1,
            image: m[8] || undefined,
            subAgentProfile: (authorJsonIdx > -1 && m[authorJsonIdx]) ? JSON.parse(m[authorJsonIdx]) : undefined
          }));
        }
      }
      return chats;
    } catch (e) {
      console.error("Error retrieving chats:", e);
      return [];
    }
  }

  // --- API Methods for Agent RAG ---

  public getAgentContext(agentId: string): { soul: string, skills: string[], memories: string[] } {
    if (!this.db) return { soul: '', skills: [], memories: [] };

    // 1. Get Soul (Identity)
    const soulRes = this.db.exec(`SELECT soul_content FROM agents WHERE id = '${agentId}'`);
    const soul = (soulRes.length > 0) ? soulRes[0].values[0][0] : '';

    // 2. Get Installed Skills
    const skillsRes = this.db.exec(`
        SELECT content FROM skills 
        WHERE is_installed = 1 
        AND (agent_id = 'global' OR agent_id = '${agentId}')
    `);

    const skills = skillsRes.length > 0
      ? skillsRes[0].values.map((v: any[]) => v[0] as string)
      : [];

    // 3. Get Recent Chat Memories
    const memRes = this.db.exec(`
        SELECT content FROM memories 
        WHERE agent_id = '${agentId}' 
        ORDER BY id DESC LIMIT 5
    `);

    const memories = memRes.length > 0
      ? memRes[0].values.map((v: any[]) => v[0] as string)
      : [];

    return { soul: soul as string, skills, memories };
  }

  public getAgentAvatar(agentId: string): string | null {
    if (!this.db) return null;
    try {
      // Check for avatar_svg column
      const colsRes = this.db.exec(`PRAGMA table_info(agents)`);
      const hasAvatarCol = colsRes[0].values.some((col: any[]) => col[1] === 'avatar_svg');
      if (!hasAvatarCol) return null;

      const res = this.db.exec(`SELECT avatar_svg FROM agents WHERE id = '${agentId}'`);
      if (res.length > 0 && res[0].values[0][0]) {
        return res[0].values[0][0] as string;
      }
    } catch (e) {
      console.error("Error getting agent avatar", e);
    }
    return null;
  }

  public saveAgentAvatar(agentId: string, avatarData: string) {
    if (!this.db) return;
    try {
      this.db.run(`UPDATE agents SET avatar_svg = ? WHERE id = ?`, [avatarData, agentId]);
      this.save();
    } catch (e) {
      console.error("Error saving agent avatar", e);
    }
  }

  // --- Wiki Memory Methods (Long Term Memory) ---

  public saveWikiMemory(memory: MemoryWiki) {
    if (!this.db) return;
    this.db.run(`
        INSERT INTO wiki_memories (id, agent_id, title, tags, summary, html_content, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [memory.id, memory.agentId, memory.title, JSON.stringify(memory.tags), memory.summary, memory.htmlContent, memory.timestamp.toISOString()]);
    this.save();
  }

  public getWikiMemories(): MemoryWiki[] {
    if (!this.db) return [];
    try {
      // Check if table exists first to avoid errors on fresh start before createTables
      const tableCheck = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='wiki_memories'`);
      if (tableCheck.length === 0) return [];

      const res = this.db.exec(`SELECT * FROM wiki_memories ORDER BY timestamp DESC`);
      if (res.length === 0) return [];

      return res[0].values.map((v: any[]) => ({
        id: v[0],
        agentId: v[1],
        title: v[2],
        tags: JSON.parse(v[3]),
        summary: v[4],
        htmlContent: v[5],
        timestamp: new Date(v[6])
      }));
    } catch (e) {
      return [];
    }
  }

  public searchWikiMemories(query: string): string[] {
    if (!this.db) return [];

    const terms = query.toLowerCase().split(' ').filter(w => w.length > 3);
    if (terms.length === 0) return [];

    const wikiRes = this.db.exec(`SELECT title, summary FROM wiki_memories`);
    if (wikiRes.length === 0) return [];

    const relevantMemories: string[] = [];

    wikiRes[0].values.forEach((v: any[]) => {
      const title = (v[0] as string).toLowerCase();
      const summary = (v[1] as string).toLowerCase();

      const isMatch = terms.some(term => title.includes(term) || summary.includes(term));
      if (isMatch) {
        relevantMemories.push(`[MEMORY: ${v[0]}] Summary: ${v[1]}`);
      }
    });

    return relevantMemories.slice(0, 3);
  }

  // --- Other Methods ---

  public installSkill(skill: any) {
    if (!this.db) return;
    this.db.run(`
        INSERT INTO skills (id, agent_id, name, description, content, is_installed, author, version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET is_installed=1;
    `, [skill.id, 'global', skill.name, skill.description, skill.description, 1, skill.author, skill.version]);
    this.save();
  }

  public addMemory(agentId: string, content: string) {
    if (!this.db) return;
    this.db.run(`INSERT INTO memories (agent_id, content, timestamp, type) VALUES (?, ?, ?, ?)`,
      [agentId, content, new Date().toISOString(), 'history']);
    this.save();
  }

  public upsertAgentSoul(agentId: string, name: string, soulContent: string) {
    if (!this.db) return;
    this.db.run(`
        INSERT INTO agents (id, name, soul_content, created_at) VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET soul_content = excluded.soul_content
    `, [agentId, name, soulContent, new Date().toISOString()]);
    this.save();
  }
}

export const dbService = new DatabaseService();