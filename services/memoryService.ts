import { dbService } from "./db";
import { MemoryWiki } from "../types";

/**
 * AGENT MEMORY OS SERVICE
 * Handles the creation of "Single-File" HTML memory pages and context retrieval.
 */

export const generateMemoryWiki = (
    agentId: string,
    title: string,
    contentMarkdown: string,
    tags: string[] = []
): MemoryWiki => {
    
    const memoryId = `mem_${Date.now()}`;
    const timestamp = new Date();
    
    // Create the metadata block (machine readable)
    const metadata = {
        id: memoryId,
        task: title,
        tags: tags,
        created: timestamp.toISOString(),
        agent: agentId
    };

    // Construct the HTML "File" (human readable + machine readable)
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Agent Memory</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
        h1 { border-bottom: 2px solid #007bff; padding-bottom: 10px; color: #111; }
        .meta { background: #f4f4f9; padding: 10px; border-radius: 8px; font-size: 0.9em; color: #555; margin-bottom: 20px; }
        .tag { background: #e0e0e0; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; margin-right: 5px; }
        pre { background: #f8f8f8; padding: 15px; overflow-x: auto; border-radius: 5px; }
        blockquote { border-left: 4px solid #ddd; padding-left: 15px; color: #666; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="meta">
        <strong>Agent:</strong> ${agentId} <br/>
        <strong>Date:</strong> ${timestamp.toLocaleDateString()} <br/>
        <strong>Tags:</strong> ${tags.map(t => `<span class="tag">${t}</span>`).join('')}
    </div>

    <div id="report-content">
        ${contentMarkdown.replace(/\n/g, '<br/>')} 
        <!-- In a real implementation, we'd use a Markdown parser lib here inside the HTML -->
    </div>

    <!-- MACHINE READABLE BLOCK -->
    <script id="memory-json" type="application/json">
    ${JSON.stringify(metadata, null, 2)}
    </script>
</body>
</html>
    `;

    const summary = contentMarkdown.slice(0, 150) + "...";

    const memoryWiki: MemoryWiki = {
        id: memoryId,
        agentId,
        title,
        tags,
        summary,
        htmlContent,
        timestamp
    };

    // Index immediately
    dbService.saveWikiMemory(memoryWiki);

    return memoryWiki;
};

export const retrieveContextForTask = (userQuery: string): string => {
    // 1. Search Wiki Memories (Long Term Structured)
    const longTermMemories = dbService.searchWikiMemories(userQuery);
    
    if (longTermMemories.length === 0) return "";

    return `
    [RELEVANT LONG-TERM MEMORY]
    The following are summaries of past tasks/reports that might be relevant:
    ${longTermMemories.join('\n')}
    `;
};
