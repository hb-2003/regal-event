import { createClient, Client } from "@libsql/client";
import bcrypt from "bcryptjs";

let db: Client | null = null;

export default async function getDb(): Promise<Client> {
  if (!db) {
    const url = process.env.DATABASE_URL || "file:regal-events.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN;

    db = createClient({ url, authToken });

    // Enable WAL and foreign keys if using a local file database
    if (url.startsWith("file:")) {
      await db.execute("PRAGMA journal_mode = WAL");
      await db.execute("PRAGMA foreign_keys = ON");
    }

    await initSchema(db);
  }
  return db;
}

async function initSchema(database: Client) {
  // executeMultiple allows running multiple statements in one call
  await database.executeMultiple(`
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

  await seedData(database);
}

async function seedData(database: Client) {
  // Check if admin exists
  const adminRes = await database.execute({
    sql: "SELECT id FROM admins WHERE username = ?",
    args: ["admin"]
  });

  if (adminRes.rows.length === 0) {
    const hash = bcrypt.hashSync(
      process.env.ADMIN_PASSWORD || "admin123",
      10
    );
    await database.execute({
      sql: "INSERT INTO admins (username, password) VALUES (?, ?)",
      args: ["admin", hash]
    });
  }

  // Check if categories exist
  const catRes = await database.execute("SELECT COUNT(*) as count FROM categories");
  const count = Number(catRes.rows[0]?.count || 0);

  if (count === 0) {
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

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      await database.execute({
        sql: "INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)",
        args: [cat.name, cat.slug, cat.description, i + 1]
      });
    }
  }
}
