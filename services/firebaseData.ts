import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    writeBatch,
} from 'firebase/firestore';
import { firestoreDb } from './firebase';

// ──────────────────────── Types ────────────────────────

export interface FirebaseEvent {
    id?: string;
    title: string;
    date: string;
    time: string;
    type: 'Online' | 'In-person';
    organizer: string;
    rating: number;
    attendees: number;
    imageUrl: string;
    category: string;
    description?: string;
    createdAt?: number;
}

export interface FirebaseMenuItem {
    id?: string;
    title: string;
    description: string;
    price: number;
    image: string;
    section: 'Sandwiches' | 'Wraps' | 'Rice Bowls' | 'Beverages';
    createdAt?: number;
}

export interface FirebaseGroup {
    id?: string;
    name: string;
    category: string;
    image: string;
    likes: number;
    description?: string;
    createdAt?: number;
}

// ──────────────────────── Events CRUD ────────────────────────

const eventsCol = () => collection(firestoreDb, 'events');

export async function getEvents(): Promise<FirebaseEvent[]> {
    const snapshot = await getDocs(query(eventsCol(), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseEvent));
}

export async function addEvent(event: Omit<FirebaseEvent, 'id'>): Promise<string> {
    const docRef = await addDoc(eventsCol(), { ...event, createdAt: Date.now() });
    return docRef.id;
}

export async function updateEvent(id: string, data: Partial<FirebaseEvent>): Promise<void> {
    await updateDoc(doc(firestoreDb, 'events', id), data);
}

export async function deleteEvent(id: string): Promise<void> {
    await deleteDoc(doc(firestoreDb, 'events', id));
}

// ──────────────────────── Menu Items CRUD ────────────────────────

const menuCol = () => collection(firestoreDb, 'menuItems');

export async function getMenuItems(): Promise<FirebaseMenuItem[]> {
    const snapshot = await getDocs(query(menuCol(), orderBy('createdAt', 'asc')));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseMenuItem));
}

export async function addMenuItem(item: Omit<FirebaseMenuItem, 'id'>): Promise<string> {
    const docRef = await addDoc(menuCol(), { ...item, createdAt: Date.now() });
    return docRef.id;
}

export async function updateMenuItem(id: string, data: Partial<FirebaseMenuItem>): Promise<void> {
    await updateDoc(doc(firestoreDb, 'menuItems', id), data);
}

export async function deleteMenuItem(id: string): Promise<void> {
    await deleteDoc(doc(firestoreDb, 'menuItems', id));
}

// ──────────────────────── Groups CRUD ────────────────────────

const groupsCol = () => collection(firestoreDb, 'groups');

export async function getGroups(): Promise<FirebaseGroup[]> {
    const snapshot = await getDocs(query(groupsCol(), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FirebaseGroup));
}

export async function addGroup(group: Omit<FirebaseGroup, 'id'>): Promise<string> {
    const docRef = await addDoc(groupsCol(), { ...group, createdAt: Date.now() });
    return docRef.id;
}

export async function updateGroup(id: string, data: Partial<FirebaseGroup>): Promise<void> {
    await updateDoc(doc(firestoreDb, 'groups', id), data);
}

export async function deleteGroup(id: string): Promise<void> {
    await deleteDoc(doc(firestoreDb, 'groups', id));
}

// ──────────────────────── Seed Data ────────────────────────
// Seeds Firestore with the existing mock data if the collections are empty.
// Call this once on first app load.

export async function seedIfEmpty(): Promise<void> {
    try {
        // Check events
        const eventsSnap = await getDocs(eventsCol());
        if (eventsSnap.empty) {
            console.log('🌱 Seeding events...');
            const batch = writeBatch(firestoreDb);
            const seedEvents: Omit<FirebaseEvent, 'id'>[] = [
                { title: 'Holi Fest Tricity Most Premium Holi Celebration', date: 'Wed 4 Mar 2026', time: '11:00 AM', type: 'In-person', organizer: 'Taco Tribe', rating: 4.8, attendees: 79, imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200', category: 'Holi Parties', createdAt: Date.now() - 3000 },
                { title: 'Build Autonomous AI Workers with Python & LangChain (Cohort)', date: 'SAT, 28 FEB', time: '7:00 PM IST', type: 'Online', organizer: 'NonceLabs', rating: 4.8, attendees: 850, imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800', category: 'Tech', createdAt: Date.now() - 2000 },
                { title: 'Weekend Photography Walk: Capturing Urban Life', date: 'SAT, 28 FEB', time: '10:00 AM IST', type: 'In-person', organizer: 'City Snappers Group', rating: 4.6, attendees: 42, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', category: 'Hobbies', createdAt: Date.now() - 1000 },
                { title: 'Startup Networking Mixer', date: 'FRI, 27 FEB', time: '6:00 PM IST', type: 'In-person', organizer: 'Tech Founders Club', rating: 4.5, attendees: 120, imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800', category: 'Social Events', createdAt: Date.now() },
            ];
            seedEvents.forEach(ev => {
                const ref = doc(eventsCol());
                batch.set(ref, ev);
            });
            await batch.commit();
        }

        // Check groups
        const groupsSnap = await getDocs(groupsCol());
        if (groupsSnap.empty) {
            console.log('🌱 Seeding groups...');
            const batch = writeBatch(firestoreDb);
            const seedGroups: Omit<FirebaseGroup, 'id'>[] = [
                { name: 'Weekend Hikers', category: 'Fitness', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&q=80&w=200', likes: 142, createdAt: Date.now() - 4000 },
                { name: 'Startup Founders', category: 'Tech', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=200', likes: 385, createdAt: Date.now() - 3000 },
                { name: 'Local Bookworms', category: 'Arts', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=200', likes: 89, createdAt: Date.now() - 2000 },
                { name: 'Yoga & Mindfulness', category: 'Fitness', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200', likes: 215, createdAt: Date.now() - 1000 },
                { name: 'Foodie Adventurers', category: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=200', likes: 120, createdAt: Date.now() },
            ];
            seedGroups.forEach(g => {
                const ref = doc(groupsCol());
                batch.set(ref, g);
            });
            await batch.commit();
        }

        // Check menu items
        const menuSnap = await getDocs(menuCol());
        if (menuSnap.empty) {
            console.log('🌱 Seeding menu items...');
            // Firestore batch limit is 500, we have ~27 items so one batch is fine
            const batch = writeBatch(firestoreDb);
            let ts = Date.now();

            const sandwiches: Omit<FirebaseMenuItem, 'id'>[] = [
                { title: 'Creamy Mayo Egg Sandwich', description: 'Whole wheat bread, boiled egg mix with mustard mayo', price: 150, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300', section: 'Sandwiches', createdAt: ts++ },
                { title: 'Pesto, Mozzarella Sandwich', description: 'Ciabatta, fresh mozzarella, inhouse basil pesto roasted bell pepper, rocket leaf', price: 220, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300', section: 'Sandwiches', createdAt: ts++ },
                { title: 'Original Ham & Cheese Sandwich', description: 'Multigrain bread, cured chicken ham, cheese and lettuce', price: 250, image: 'https://images.unsplash.com/photo-1554522434-c088febe4dc4?auto=format&fit=crop&w=300', section: 'Sandwiches', createdAt: ts++ },
                { title: 'Grilled Chicken Sandwich', description: 'Multigrain bread, marinated grilled chicken, cheese spread, barbeque sauce', price: 230, image: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?auto=format&fit=crop&w=300', section: 'Sandwiches', createdAt: ts++ },
                { title: 'Chicken Sausage & Cheese Crossiant Sandwich', description: 'Chicken sausage, croissant, cheese, tomato, lettuce', price: 260, image: 'https://images.unsplash.com/photo-1626078722880-9286d5e0a6d5?auto=format&fit=crop&w=300', section: 'Sandwiches', createdAt: ts++ },
            ];

            const wraps: Omit<FirebaseMenuItem, 'id'>[] = [
                { title: 'BBQ CHICKEN BURRITO', description: 'Tender chicken in rich BBQ sauce wrapped in a tortilla', price: 230, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
                { title: 'BBQ PANEER BURRITO', description: 'Paneer cubes in rich BBQ sauce wrapped in a tortilla', price: 210, image: 'https://images.unsplash.com/photo-1574044199105-0aa3df7ca878?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
                { title: 'CHILI CHIPOTLE CHICKEN BURRITO', description: 'Spicy chipotle chicken wrapped with fresh veggies', price: 240, image: 'https://images.unsplash.com/photo-1584345630040-692db54b321a?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
                { title: 'CRISPY PERI PERI CHICKEN BURRITO', description: 'Peri peri spiced crispy chicken wrap', price: 250, image: 'https://images.unsplash.com/photo-1615800098774-4b53112bd22e?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
                { title: 'FAJITA VEG BURRITO', description: 'Fajita seasoned mixed vegetables in a wrap', price: 200, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
                { title: 'MEXICAN PANEER BURRITO', description: 'Mexican style paneer with beans wrapped nicely', price: 220, image: 'https://images.unsplash.com/photo-1574044199105-0aa3df7ca878?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
                { title: 'CRISPY MUSHROOM BURRITO', description: 'Crispy fried mushrooms in a delicious wrap', price: 210, image: 'https://images.unsplash.com/photo-1584345630040-692db54b321a?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
                { title: 'PERI PERI POTATO BURRITO', description: 'Spicy peri peri potatoes wrapped in a tortilla', price: 180, image: 'https://images.unsplash.com/photo-1615800098774-4b53112bd22e?auto=format&fit=crop&w=300', section: 'Wraps', createdAt: ts++ },
            ];

            const bowls: Omit<FirebaseMenuItem, 'id'>[] = [
                { title: 'BBQ CHICKEN BOWL', description: 'Tender chicken in rich BBQ sauce with rice', price: 280, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'BBQ PANEER BOWL', description: 'Paneer cubes in rich BBQ sauce with rice', price: 250, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'CHILI CHIPOTLE CHICKEN BOWL', description: 'Spicy chipotle chicken served with rice', price: 290, image: 'https://images.unsplash.com/photo-1546069901-d5bfd20bfb62?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'CRISPY MUSHROOM BOWL', description: 'Crispy fried mushrooms over flavored rice', price: 260, image: 'https://images.unsplash.com/photo-1505506874110-6a7a009d0bb6?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'CRISPY PERI PERI CHICKEN BOWL', description: 'Peri peri spiced crispy chicken with rice', price: 300, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'FAJITA VEG BOWL', description: 'Fajita seasoned mixed vegetables and rice', price: 240, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'MEXICAN PANEER BOWL', description: 'Mexican style paneer with beans and rice', price: 270, image: 'https://images.unsplash.com/photo-1505506874110-6a7a009d0bb6?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'PERI PERI POTATO BOWL', description: 'Spicy peri peri potatoes over rice', price: 220, image: 'https://images.unsplash.com/photo-1546069901-d5bfd20bfb62?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'GRILLED BARBEQUE CHICKEN PRO BOWL', description: 'Premium grilled BBQ chicken bowl', price: 340, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
                { title: 'MEXICAN PANEER PRO BOWL', description: 'Premium Mexican paneer bowl', price: 310, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=300', section: 'Rice Bowls', createdAt: ts++ },
            ];

            const beverages: Omit<FirebaseMenuItem, 'id'>[] = [
                { title: 'Classic Cold Coffee', description: 'Rich and creamy cold coffee', price: 150, image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=300', section: 'Beverages', createdAt: ts++ },
                { title: 'Iced Americano', description: 'Chilled espresso with water and ice', price: 130, image: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?auto=format&fit=crop&w=300', section: 'Beverages', createdAt: ts++ },
                { title: 'Mango Smoothie', description: 'Fresh mangoes blended with yogurt', price: 200, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=300', section: 'Beverages', createdAt: ts++ },
                { title: 'Lemon Iced Tea', description: 'Refreshing iced tea with a hint of lemon', price: 120, image: 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=300', section: 'Beverages', createdAt: ts++ },
            ];

            [...sandwiches, ...wraps, ...bowls, ...beverages].forEach(item => {
                const ref = doc(menuCol());
                batch.set(ref, item);
            });
            await batch.commit();
        }

        console.log('✅ Firebase seed check complete');
    } catch (error) {
        console.error('Firebase seed error:', error);
    }
}
