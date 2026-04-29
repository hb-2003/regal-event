import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "regal-events.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      event_date TEXT NOT NULL,
      category TEXT NOT NULL,
      venue TEXT,
      guests INTEGER,
      budget TEXT,
      notes TEXT,
      status TEXT DEFAULT 'Pending',
      admin_notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      category TEXT,
      image_path TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      youtube_url TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedData(database);
}

function seedData(database: Database.Database) {
  const adminExists = database
    .prepare("SELECT id FROM admins WHERE username = ?")
    .get("admin");

  if (!adminExists) {
    const hash = bcrypt.hashSync(
      process.env.ADMIN_PASSWORD || "admin123",
      10
    );
    database
      .prepare("INSERT INTO admins (username, password) VALUES (?, ?)")
      .run("admin", hash);
  }

  const catCount = database
    .prepare("SELECT COUNT(*) as count FROM categories")
    .get() as { count: number };

  if (catCount.count === 0) {
    const categories = [
      { name: "Baby Shower", slug: "baby-shower", description: "Beautiful celebrations welcoming a new arrival into the world." },
      { name: "Baby Welcome", slug: "baby-welcome", description: "Warm and joyful events to celebrate your precious newborn." },
      { name: "Birthday Decoration", slug: "birthday-decoration", description: "Stunning birthday setups for all ages, from intimate to grand." },
      { name: "Naming Ceremony", slug: "naming-ceremony", description: "Elegant naming ceremonies with beautiful cultural touches." },
      { name: "Room Decoration", slug: "room-decoration", description: "Transform any room into a magical, personalised space." },
      { name: "Theme Decoration", slug: "theme-decoration", description: "Fully themed events crafted entirely around your vision." },
      { name: "Haldi Ceremony", slug: "haldi-ceremony", description: "Traditional and vibrant Haldi ceremony décor and planning." },
      { name: "Bride to Be", slug: "bride-to-be", description: "Luxurious bridal celebrations and unforgettable hen parties." },
      { name: "Engagement", slug: "engagement", description: "Romantic engagement setups to mark the start of forever." },
      { name: "Shop Inauguration", slug: "shop-inauguration", description: "Grand openings that make a powerful first impression." },
      { name: "Corporate Event", slug: "corporate-event", description: "Professional corporate event planning, branding and design." },
      { name: "Surprise Planning", slug: "surprise-planning", description: "Secret surprise events planned and executed to perfection." },
      { name: "Anniversary", slug: "anniversary", description: "Romantic anniversary celebrations for every milestone." },
      { name: "National Festival", slug: "national-festival", description: "Vibrant festive celebrations for national occasions and holidays." },
    ];

    const insert = database.prepare(
      "INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)"
    );
    categories.forEach((cat, i) =>
      insert.run(cat.name, cat.slug, cat.description, i + 1)
    );
  }
}

export default getDb;
