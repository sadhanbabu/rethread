import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'rethread.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize Tables
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      account_type TEXT CHECK(account_type IN ('donor', 'receiver')) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ngos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('ngo', 'individual', 'community')) DEFAULT 'ngo',
      description TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      max_capacity INTEGER DEFAULT 500,
      current_storage INTEGER DEFAULT 120,
      contact_email TEXT,
      phone TEXT,
      image_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS ngo_needs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ngo_id INTEGER NOT NULL,
      item_type TEXT NOT NULL,
      size TEXT NOT NULL,
      gender TEXT NOT NULL,
      season TEXT DEFAULT 'All-Season',
      quantity_needed INTEGER NOT NULL,
      quantity_fulfilled INTEGER DEFAULT 0,
      urgency TEXT CHECK(urgency IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
      notes TEXT,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      item_type TEXT NOT NULL,
      size TEXT NOT NULL,
      gender TEXT NOT NULL,
      season TEXT DEFAULT 'All-Season',
      condition TEXT CHECK(condition IN ('New', 'Gently Used', 'Worn', 'Needs Repair')) NOT NULL,
      photo_url TEXT,
      donor_name TEXT,
      donor_location_name TEXT,
      latitude REAL,
      longitude REAL,
      status TEXT DEFAULT 'available',
      confirmed_ngo_id INTEGER,
      recycling_partner_name TEXT,
      recycling_outcome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (confirmed_ngo_id) REFERENCES ngos(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      ngo_id INTEGER NOT NULL,
      need_id INTEGER,
      match_score INTEGER NOT NULL,
      distance_km REAL NOT NULL,
      reasoning TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE CASCADE,
      FOREIGN KEY (need_id) REFERENCES ngo_needs(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS recycling_partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      specialty TEXT,
      address TEXT,
      latitude REAL,
      longitude REAL,
      materials_accepted TEXT,
      phone TEXT,
      image_url TEXT
    );
  `);

  // Safe migration checks for schema updates
  try {
    db.exec("ALTER TABLE items ADD COLUMN confirmed_ngo_id INTEGER;");
  } catch (e) {
    // Column already exists
  }

  // Seed Data if empty
  const ngoCount = db.prepare('SELECT COUNT(*) as count FROM ngos').get().count;
  if (ngoCount === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  console.log('Seeding ReThread database with demo data...');

  const insertNgo = db.prepare(`
    INSERT INTO ngos (name, type, description, address, latitude, longitude, max_capacity, current_storage, contact_email, phone, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNeed = db.prepare(`
    INSERT INTO ngo_needs (ngo_id, item_type, size, gender, season, quantity_needed, quantity_fulfilled, urgency, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO items (title, description, item_type, size, gender, season, condition, photo_url, donor_name, donor_location_name, latitude, longitude, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRecycler = db.prepare(`
    INSERT INTO recycling_partners (name, specialty, address, latitude, longitude, materials_accepted, phone, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Seed Finders (NGOs, Individuals, Community Orgs with distinct IDs)
  const ngos = [
    {
      name: "Hope Haven Emergency Shelter",
      type: "ngo",
      description: "Providing shelter, warmth, and clothing for families experiencing homelessness.",
      address: "745 Mission St, San Francisco, CA",
      latitude: 37.7858,
      longitude: -122.4011,
      max_capacity: 300,
      current_storage: 180,
      email: "donations@hopehaven.org",
      phone: "(415) 555-0192",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Urban Youth Outreach Center",
      type: "ngo",
      description: "Supporting homeless teens and young adults with warm outerwear and job interview clothing.",
      address: "1230 Market St, San Francisco, CA",
      latitude: 37.7772,
      longitude: -122.4154,
      max_capacity: 200,
      current_storage: 195, // Near capacity!
      email: "intake@urbanyouth.org",
      phone: "(415) 555-0144",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Individual Recipient A (Maria S.)",
      type: "individual",
      description: "Family of 4 seeking winter jackets and kids footwear.",
      address: "240 Valencia St, San Francisco, CA",
      latitude: 37.7694,
      longitude: -122.4223,
      max_capacity: 10,
      current_storage: 2,
      email: "maria.s@example.com",
      phone: "(415) 555-0821",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Individual Recipient B (David K.)",
      type: "individual",
      description: "Single parent looking for work clothing.",
      address: "880 Harrison St, San Francisco, CA",
      latitude: 37.7801,
      longitude: -122.4045,
      max_capacity: 10,
      current_storage: 1,
      email: "david.k@example.com",
      phone: "(415) 555-0377",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Golden Gate Veteran Support",
      type: "ngo",
      description: "Dignified clothing distribution for military veterans seeking career transitions.",
      address: "450 Golden Gate Ave, San Francisco, CA",
      latitude: 37.7816,
      longitude: -122.4181,
      max_capacity: 250,
      current_storage: 90,
      email: "support@ggvets.org",
      phone: "(415) 555-0911",
      image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Bay Area Community Closet",
      type: "community",
      description: "Local neighborhood free closet and mutual aid organization.",
      address: "1600 Divisadero St, San Francisco, CA",
      latitude: 37.7845,
      longitude: -122.4395,
      max_capacity: 350,
      current_storage: 120,
      email: "help@baycommunitycloset.org",
      phone: "(415) 555-0632",
      image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const ngoIds = [];
  for (const ngo of ngos) {
    const res = insertNgo.run(
      ngo.name, ngo.type, ngo.description, ngo.address, ngo.latitude, ngo.longitude,
      ngo.max_capacity, ngo.current_storage, ngo.email, ngo.phone, ngo.image
    );
    ngoIds.push(res.lastInsertRowid);
  }

  // Seed Needs for NGOs
  const needs = [
    // Hope Haven Shelter (NGO 1)
    { ngo_id: ngoIds[0], item_type: "Jacket", size: "L", gender: "Men", season: "Winter", quantity_needed: 12, quantity_fulfilled: 2, urgency: "High", notes: "Heavy winter coats needed urgently for cold nights." },
    { ngo_id: ngoIds[0], item_type: "Boots", size: "M", gender: "Unisex", season: "Winter", quantity_needed: 8, quantity_fulfilled: 3, urgency: "High", notes: "Waterproof footwear." },
    { ngo_id: ngoIds[0], item_type: "Blanket", size: "L", gender: "Unisex", season: "All-Season", quantity_needed: 25, quantity_fulfilled: 10, urgency: "Medium", notes: "Clean fleece or wool blankets." },
    
    // Urban Youth Outreach (NGO 2)
    { ngo_id: ngoIds[1], item_type: "Hoodie", size: "M", gender: "Unisex", season: "All-Season", quantity_needed: 15, quantity_fulfilled: 5, urgency: "High", notes: "Youth sizes M/L heavily requested." },
    { ngo_id: ngoIds[1], item_type: "Jeans", size: "M", gender: "Men", season: "All-Season", quantity_needed: 10, quantity_fulfilled: 8, urgency: "Low", notes: "Denim pants." },

    // St. Vincent Family Home (NGO 3)
    { ngo_id: ngoIds[2], item_type: "Kids Coat", size: "S", gender: "Kids", season: "Winter", quantity_needed: 18, quantity_fulfilled: 4, urgency: "High", notes: "Warm coats for toddlers and kids aged 4-10." },
    { ngo_id: ngoIds[2], item_type: "Sweater", size: "M", gender: "Women", season: "Winter", quantity_needed: 14, quantity_fulfilled: 6, urgency: "Medium", notes: "Casual knit sweaters." },

    // Eco Closet (NGO 4)
    { ngo_id: ngoIds[3], item_type: "Suit Jacket", size: "L", gender: "Men", season: "All-Season", quantity_needed: 7, quantity_fulfilled: 1, urgency: "High", notes: "Professional attire for job interviews." },
    { ngo_id: ngoIds[3], item_type: "Blouse", size: "M", gender: "Women", season: "All-Season", quantity_needed: 12, quantity_fulfilled: 9, urgency: "Low", notes: "Workplace clothing." },

    // Golden Gate Vets (NGO 5)
    { ngo_id: ngoIds[4], item_type: "Jacket", size: "XL", gender: "Men", season: "Winter", quantity_needed: 10, quantity_fulfilled: 2, urgency: "High", notes: "Heavy waterproof coats." },
    { ngo_id: ngoIds[4], item_type: "Pants", size: "L", gender: "Men", season: "All-Season", quantity_needed: 15, quantity_fulfilled: 5, urgency: "Medium", notes: "Khakis and sturdy trousers." },

    // Bay Area Children's Aid (NGO 6)
    { ngo_id: ngoIds[5], item_type: "Kids Shoes", size: "Kids", gender: "Kids", season: "All-Season", quantity_needed: 20, quantity_fulfilled: 8, urgency: "High", notes: "Sneakers for school children." }
  ];

  for (const need of needs) {
    insertNeed.run(
      need.ngo_id, need.item_type, need.size, need.gender, need.season,
      need.quantity_needed, need.quantity_fulfilled, need.urgency, need.notes
    );
  }

  // Seed Sample Donated Items
  const sampleItems = [
    {
      title: "Warm North Face Puffer Jacket",
      description: "Navy blue insulated winter coat, barely worn, extremely warm.",
      item_type: "Jacket",
      size: "L",
      gender: "Men",
      season: "Winter",
      condition: "Gently Used",
      photo_url: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80",
      donor_name: "Alex Rivera",
      donor_location: "SoMa, San Francisco",
      lat: 37.7812,
      lng: -122.3989,
      status: "available"
    },
    {
      title: "Kids Waterproof Winter Parka",
      description: "Bright red youth jacket, fully fleece lined, size 8-10.",
      item_type: "Kids Coat",
      size: "S",
      gender: "Kids",
      season: "Winter",
      condition: "New",
      photo_url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=600&q=80",
      donor_name: "Sarah Chen",
      donor_location: "Mission District, SF",
      lat: 37.7599,
      lng: -122.4148,
      status: "available"
    },
    {
      title: "Gray Wool Knit Sweater",
      description: "Cozy oversized wool sweater, soft fabric.",
      item_type: "Sweater",
      size: "M",
      gender: "Women",
      season: "Winter",
      condition: "Gently Used",
      photo_url: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
      donor_name: "Emma Watson",
      donor_location: "Hayes Valley, SF",
      lat: 37.7765,
      lng: -122.4242,
      status: "available"
    },
    {
      title: "Men's Navy Blazer / Business Suit",
      description: "Single-breasted wool suit jacket, perfect for job interviews.",
      item_type: "Suit Jacket",
      size: "L",
      gender: "Men",
      season: "All-Season",
      condition: "Gently Used",
      photo_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80",
      donor_name: "Marcus Vance",
      donor_location: "Financial District, SF",
      lat: 37.7946,
      lng: -122.4001,
      status: "available"
    },
    {
      title: "Torn Denim Jeans with Frayed Hem",
      description: "Heavy wear denim jeans with torn knee seam and ripped pocket.",
      item_type: "Jeans",
      size: "M",
      gender: "Men",
      season: "All-Season",
      condition: "Needs Repair", // Will test recycling auto-route!
      photo_url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80",
      donor_name: "Liam O'Connor",
      donor_location: "Lower Haight, SF",
      lat: 37.7719,
      lng: -122.4311,
      status: "routed_recycling"
    },
    {
      title: "Heavy Fleece Thermal Hoodie",
      description: "Charcoal unisex fleece pullover hoodie.",
      item_type: "Hoodie",
      size: "M",
      gender: "Unisex",
      season: "All-Season",
      condition: "Gently Used",
      photo_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80",
      donor_name: "David Kim",
      donor_location: "Castro, SF",
      lat: 37.7609,
      lng: -122.4350,
      status: "available"
    },
    {
      title: "Kids Adidas Running Sneakers",
      description: "Youth size 4 sneakers, clean sole, great condition.",
      item_type: "Kids Shoes",
      size: "Kids",
      gender: "Kids",
      season: "All-Season",
      condition: "Gently Used",
      photo_url: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80",
      donor_name: "Jessica Miller",
      donor_location: "Pacific Heights, SF",
      lat: 37.7925,
      lng: -122.4382,
      status: "available"
    },
    {
      title: "Heavy Duty Waterproof Winter Boots",
      description: "Insulated snow boots with deep rubber tread.",
      item_type: "Boots",
      size: "M",
      gender: "Unisex",
      season: "Winter",
      condition: "Gently Used",
      photo_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
      donor_name: "Robert Davis",
      donor_location: "SoMa, SF",
      lat: 37.7780,
      lng: -122.4080,
      status: "available"
    }
  ];

  for (const item of sampleItems) {
    insertItem.run(
      item.title, item.description, item.item_type, item.size, item.gender, item.season,
      item.condition, item.photo_url, item.donor_name, item.donor_location,
      item.lat, item.lng, item.status
    );
  }

  // Seed Recycling Partners
  const recyclers = [
    {
      name: "Bay Area Material Recovery & Fiber Lab",
      specialty: "Industrial Cotton & Denim Mechanical Shredding",
      address: "1400 16th St, San Francisco, CA",
      latitude: 37.7662,
      longitude: -122.3955,
      materials: "Denim, Heavy Cotton, Knits, Polyester Blends",
      phone: "(415) 555-8811",
      image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "EcoThread Upcycling & Repair Studio",
      specialty: "Garment Mending, Zipper Repair & Patching",
      address: "520 3rd St, San Francisco, CA",
      latitude: 37.7818,
      longitude: -122.3965,
      materials: "Outerwear, Wool Coats, Leather, Zippers",
      phone: "(415) 555-4422",
      image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80"
    },
    {
      name: "Pacific Circular Textile Hub",
      specialty: "Synthetic Fiber Chemical Recycling & Insulation Conversion",
      address: "2100 3rd St, San Francisco, CA",
      latitude: 37.7611,
      longitude: -122.3888,
      materials: "Polyester, Nylon, Synthetic Fleece, Damaged Shoes",
      phone: "(415) 555-9933",
      image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=600&q=80"
    }
  ];

  for (const r of recyclers) {
    insertRecycler.run(
      r.name, r.specialty, r.address, r.latitude, r.longitude,
      r.materials, r.phone, r.image
    );
  }

  console.log('Database seeded successfully!');
}

initDb();

export default db;
