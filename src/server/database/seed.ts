import "reflect-metadata";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORY_IMAGES } from "@/lib/category-display";
import { AppDataSource } from "./data-source";
import { Admin } from "./entities/Admin.entity";
import { Category } from "./entities/Category.entity";
import { Review } from "./entities/Review.entity";
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
          image: DEFAULT_CATEGORY_IMAGES[cat.slug] ?? null,
          sort_order: i + 1,
        })
      );
    }
    console.log(`Seeded ${categories.length} categories`);
  } else {
    const existing = await categoryRepo.find();
    let backfilled = 0;
    for (const cat of existing) {
      if (!cat.image && DEFAULT_CATEGORY_IMAGES[cat.slug]) {
        cat.image = DEFAULT_CATEGORY_IMAGES[cat.slug];
        await categoryRepo.save(cat);
        backfilled += 1;
      }
    }
    if (backfilled > 0) {
      console.log(`Backfilled images for ${backfilled} categories`);
    }
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

  const reviewRepo = AppDataSource.getRepository(Review);
  const reviewCount = await reviewRepo.count();
  if (reviewCount === 0) {
    const approvedReviews = [
      {
        client_name: "Lady Charlotte Ashworth",
        client_location: "Mayfair, London",
        event_title: "Summer Wedding Gala",
        event_year: 2025,
        rating: 5,
        review_text:
          "Regal Event transformed our vision into something that transcended our grandest expectations. Every detail was absolute perfection.",
        detail:
          "200 guests. Florals by Philippa Craddock, catering by Raymond Blanc. A seamless 14-hour experience.",
        sort_order: 1,
      },
      {
        client_name: "James Whitmore",
        client_location: "CEO, Whitmore Capital",
        event_title: "Annual Investment Gala",
        event_year: 2025,
        rating: 5,
        review_text:
          "Our annual gala has never been more spectacular. Regal Event's attention to the finest nuances is simply unmatched.",
        detail:
          "500 executives at The Gherkin. Full AV, live jazz quartet, three-course Michelin menu. Flawless.",
        sort_order: 2,
      },
      {
        client_name: "Priya & Oliver Shah",
        client_location: "Kensington, London",
        event_title: "Engagement Soirée",
        event_year: 2025,
        rating: 5,
        review_text:
          "From first consultation to the final champagne toast, Regal made us feel as though we were their only clients in the world.",
        detail:
          "Intimate dinner for 40 at a private Notting Hill townhouse. String quartet, gold-leaf personalised menus.",
        sort_order: 3,
      },
      {
        client_name: "Elena Vasquez",
        client_location: "Chelsea, London",
        event_title: "Milestone Birthday Celebration",
        event_year: 2026,
        rating: 5,
        review_text:
          "An evening of pure theatre — the florals, the lighting, the choreography of service. Our guests are still speaking of it weeks later.",
        detail: "Black-tie dinner for 120 with live harp and bespoke gold tablescapes.",
        sort_order: 4,
      },
      {
        client_name: "Marcus & Amara Chen",
        client_location: "Hampstead, London",
        event_title: "Naming Ceremony",
        event_year: 2026,
        rating: 5,
        review_text:
          "They honoured our traditions while elevating every moment with contemporary elegance. A celebration our family will treasure forever.",
        detail: "Garden ceremony for 80 guests with artisan sweet tables and soft drapery.",
        sort_order: 5,
      },
      {
        client_name: "The Hartwell Foundation",
        client_location: "City of London",
        event_title: "Charity Benefit Evening",
        event_year: 2026,
        rating: 5,
        review_text:
          "Impeccable production from first brief to final applause. Regal Event delivered a prestige evening that exceeded our fundraising goals.",
        detail: "Silent auction, keynote stage, and champagne reception for 300 patrons.",
        sort_order: 6,
      },
    ];

    for (const r of approvedReviews) {
      await reviewRepo.save(
        reviewRepo.create({
          ...r,
          booking_id: null,
          status: "approved",
          submitted_at: new Date(),
          moderated_at: new Date(),
        })
      );
    }
    console.log(`Seeded ${approvedReviews.length} approved reviews`);
  }

  await AppDataSource.destroy();
  console.log("Seeding complete");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
