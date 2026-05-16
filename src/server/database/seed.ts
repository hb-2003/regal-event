import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "./data-source";
import { Admin } from "./entities/Admin.entity";
import { Category } from "./entities/Category.entity";
import { Setting } from "./entities/Setting.entity";

async function seed() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminRepo = AppDataSource.getRepository(Admin);
  const existingAdmin = await adminRepo.findOneBy({ username: adminUsername });
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);
    await adminRepo.save(
      adminRepo.create({ username: adminUsername, password: hash })
    );
    console.log(`Seeded default admin user (${adminUsername})`);
  }

  const categoryRepo = AppDataSource.getRepository(Category);
  const categoryCount = await categoryRepo.count();
  if (categoryCount === 0) {
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
      await categoryRepo.save(
        categoryRepo.create({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          sort_order: i + 1,
        })
      );
    }
    console.log(`Seeded ${categories.length} categories`);
  }

  const settingRepo = AppDataSource.getRepository(Setting);
  const settingsCount = await settingRepo.count();
  if (settingsCount === 0) {
    const defaultSettings = [
      {
        key: "home_hero_images",
        value: JSON.stringify([
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80",
          "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
          "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
          "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80",
          "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
        ]),
      },
      {
        key: "about_hero_image",
        value:
          "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=2000&q=80",
      },
    ];

    for (const s of defaultSettings) {
      await settingRepo.save(settingRepo.create(s));
    }
    console.log(`Seeded ${defaultSettings.length} settings`);
  }

  await AppDataSource.destroy();
  console.log("Seeding complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
