import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding TiffinGo — Surrey launch...');

  // ── Chai Bar Surrey ──────────────────────────────────
  await prisma.kitchen.upsert({
    where: { id: 'chaibar-surrey' },
    update: {},
    create: {
      id: 'chaibar-surrey',
      name: 'The Chai Bar',
      tagline: 'Authentic chai. Real street food.',
      description: 'Surrey\'s favourite chai café. Masala chai, kadak chai, parathas, wraps, pakodas — all the good stuff, delivered to your door or ready for pickup.',
      cuisine: 'Indian',
      type: 'restaurant',
      address: 'Surrey, BC',
      city: 'Surrey',
      rating: 4.8,
      reviewCount: 0,
      isOpen: true,
      isHalal: true,
      isVeg: true,
      pricePerMeal: 12,
      weeklyPrice: 50,
      weeklySavingsPct: 17,
      cutoffTime: '8:00pm',
      deliverySlots: ['12:00pm – 1:00pm', '5:00pm – 6:00pm'],
    },
  });
  console.log('✅ The Chai Bar — Surrey created');

  // Delete old meals
  await prisma.weeklyMeal.deleteMany({ where: { kitchenId: 'chaibar-surrey' } });

  // Real Chai Bar combos — Mon to Fri
  const chaibarMeals = [
    {
      day: 'Mon', date: 'This Mon', emoji: '🫖',
      name: 'Masala Chai + Paneer Paratha',
      description: 'Our signature masala chai brewed with premium spices + 2 crispy paneer parathas served with dahi and tamarind chutney',
      protein: '18g', calories: 520,
      tags: ['Vegetarian', 'Halal'],
    },
    {
      day: 'Tue', date: 'This Tue', emoji: '🌯',
      name: 'Kadak Chai + Fully Loaded Wrap',
      description: 'Bold strong kadak chai + our fully loaded wrap stuffed with spiced veggies, noodles, sauces and paneer',
      protein: '22g', calories: 640,
      tags: ['Vegetarian', 'Halal'],
    },
    {
      day: 'Wed', date: 'This Wed', emoji: '🍟',
      name: 'Elaichi Chai + Mix Pakoda Platter',
      description: 'Fragrant cardamom chai + mix pakoda platter with onion, spinach, bread pakodas served with mint chutney',
      protein: '16g', calories: 580,
      tags: ['Vegetarian', 'Halal'],
    },
    {
      day: 'Thu', date: 'This Thu', emoji: '🍔',
      name: 'Kesar Badam Milk + Paneer Burger',
      description: 'Rich saffron almond milk + our spicy paneer noodle burger with house sauce and peri peri fries',
      protein: '24g', calories: 720,
      tags: ['Vegetarian', 'Halal'],
    },
    {
      day: 'Fri', date: 'This Fri', emoji: '🥗',
      name: 'Kashmiri Chai + Samosa Chaat',
      description: 'Creamy pink Kashmiri chai with pistachios + tawa tikki chaat with yogurt, chutneys and sev — the perfect Friday treat',
      protein: '14g', calories: 610,
      tags: ['Vegetarian', 'Halal'],
    },
  ];

  for (const meal of chaibarMeals) {
    await prisma.weeklyMeal.create({ data: { kitchenId: 'chaibar-surrey', ...meal } });
  }
  console.log('✅ Chai Bar weekly combos created (Mon–Fri)');

  // ── Placeholder tiffin kitchen 1 ─────────────────────
  await prisma.kitchen.upsert({
    where: { id: 'ghar-surrey' },
    update: {},
    create: {
      id: 'ghar-surrey',
      name: 'Ghar Ka Khana',
      tagline: 'Home cooking. Nothing more.',
      description: 'Authentic North Indian home cooking by local home chefs in Surrey. Fresh dals, curries and rotis delivered daily.',
      cuisine: 'Indian',
      type: 'tiffin',
      address: 'Surrey, BC',
      city: 'Surrey',
      rating: 0,
      reviewCount: 0,
      isOpen: false,
      isHalal: true,
      isVeg: false,
      pricePerMeal: 9,
      weeklyPrice: 38,
      weeklySavingsPct: 16,
      cutoffTime: '8:00pm',
      deliverySlots: ['12:00pm – 1:00pm'],
    },
  });
  console.log('✅ Ghar Ka Khana placeholder created (coming soon)');

  console.log('');
  console.log('🎉 Database seeded! TiffinGo Surrey is ready.');
  console.log('   Chai Bar: LIVE');
  console.log('   Ghar Ka Khana: COMING SOON');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
