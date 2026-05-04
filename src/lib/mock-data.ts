import { Kitchen } from './types';

export const MOCK_KITCHENS: Kitchen[] = [
  {
    id: 'chabar',
    name: 'Chabar Kitchen',
    tagline: 'Bold flavours. Honest food.',
    description: 'Our own restaurant chain. Every meal is cooked fresh daily with no shortcuts.',
    cuisine: 'Indian',
    type: 'restaurant',
    address: '512 Granville St',
    city: 'Vancouver',
    rating: 4.8,
    reviewCount: 312,
    isOpen: true,
    isHalal: true,
    isVeg: false,
    deliverySlots: ['12:00pm', '6:00pm'],
    cutoffTime: '8:00pm',
    pricePerMeal: 13,
    weeklyPrice: 55,
    weeklySavingsPct: 15,
  },
  {
    id: 'ghar-ka-khana',
    name: 'Ghar Ka Khana',
    tagline: 'Home cooking. Nothing more.',
    description: 'Authentic North Indian home cooking made by real home chefs. Dals, curries, fresh rotis daily.',
    cuisine: 'Indian',
    type: 'tiffin',
    address: '234 Robson St',
    city: 'Vancouver',
    rating: 4.9,
    reviewCount: 183,
    isOpen: true,
    isHalal: true,
    isVeg: false,
    deliverySlots: ['12:00pm', '6:00pm'],
    cutoffTime: '8:00pm',
    pricePerMeal: 9,
    weeklyPrice: 38,
    weeklySavingsPct: 16,
  },
  {
    id: 'nourish',
    name: 'Nourish Box',
    tagline: 'Clean food. Real ingredients.',
    description: 'Macro-balanced meals for health-conscious eaters. High protein, whole ingredients, daily.',
    cuisine: 'Healthy',
    type: 'tiffin',
    address: '89 Commercial Dr',
    city: 'Vancouver',
    rating: 4.7,
    reviewCount: 142,
    isOpen: true,
    isHalal: false,
    isVeg: true,
    deliverySlots: ['12:00pm'],
    cutoffTime: '8:00pm',
    pricePerMeal: 11,
    weeklyPrice: 46,
    weeklySavingsPct: 16,
  },
  {
    id: 'desi-dhaba',
    name: 'Desi Dhaba',
    tagline: 'Punjab on a plate.',
    description: 'Sarson da saag, makki roti, authentic tadkas. Real Punjabi home cooking.',
    cuisine: 'Punjabi',
    type: 'tiffin',
    address: '14 Fraser St',
    city: 'Vancouver',
    rating: 4.8,
    reviewCount: 97,
    isOpen: false,
    isHalal: true,
    isVeg: false,
    deliverySlots: ['12:00pm'],
    cutoffTime: '8:00pm',
    pricePerMeal: 8,
    weeklyPrice: 34,
    weeklySavingsPct: 15,
  },
];

// Weekly meal calendar — one meal per day per kitchen
export const WEEKLY_MEALS: Record<string, WeekMeal[]> = {
  'chabar': [
    { day: 'Mon', date: 'Jan 13', emoji: '🍗', name: 'Butter chicken set', description: 'Creamy butter chicken, jeera rice, fresh roti, cucumber raita', protein: '38g', calories: 680, tags: ['Halal', 'High protein'] },
    { day: 'Tue', date: 'Jan 14', emoji: '🫘', name: 'Dal makhani set', description: 'Slow-cooked black lentils, basmati rice, green salad, pickle', protein: '24g', calories: 590, tags: ['Halal', 'Vegetarian'] },
    { day: 'Wed', date: 'Jan 15', emoji: '🍚', name: 'Chicken biryani', description: 'Dum-cooked basmati, tender chicken, saffron, mint raita, salan', protein: '42g', calories: 720, tags: ['Halal', 'High protein'] },
    { day: 'Thu', date: 'Jan 16', emoji: '🧆', name: 'Paneer tikka masala', description: 'Chargrilled paneer, rich tomato masala, roti, dal soup', protein: '28g', calories: 620, tags: ['Vegetarian'] },
    { day: 'Fri', date: 'Jan 17', emoji: '🥩', name: 'Seekh kebab platter', description: '4 seekh kebabs, garlic naan, mint chutney, onion salad', protein: '46g', calories: 640, tags: ['Halal', 'High protein'] },
  ],
  'ghar-ka-khana': [
    { day: 'Mon', date: 'Jan 13', emoji: '🫘', name: 'Dal tadka + rice', description: 'Yellow dal tadka, basmati rice, fresh roti, achaar', protein: '22g', calories: 520, tags: ['Halal', 'Vegetarian'] },
    { day: 'Tue', date: 'Jan 14', emoji: '🥘', name: 'Chole bhature', description: 'Spiced chickpeas, 2 fluffy bhaturas, onion salad, lassi', protein: '24g', calories: 740, tags: ['Vegetarian'] },
    { day: 'Wed', date: 'Jan 15', emoji: '🍗', name: 'Chicken karahi', description: 'Wok-cooked chicken, fresh tomatoes, ginger, roti, salad', protein: '41g', calories: 580, tags: ['Halal', 'High protein'] },
    { day: 'Thu', date: 'Jan 16', emoji: '🧀', name: 'Paneer paratha set', description: '3 paneer parathas, yogurt, pickle, masala chai', protein: '28g', calories: 680, tags: ['Vegetarian'] },
    { day: 'Fri', date: 'Jan 17', emoji: '🍖', name: 'Lamb keema + roti', description: 'Minced lamb curry, 3 fresh rotis, cucumber raita, salad', protein: '41g', calories: 660, tags: ['Halal', 'High protein'] },
  ],
  'nourish': [
    { day: 'Mon', date: 'Jan 13', emoji: '🥗', name: 'Grilled chicken bowl', description: 'Herb chicken breast, quinoa, roasted veg, tahini dressing', protein: '44g', calories: 490, tags: ['High protein', 'Low carb'] },
    { day: 'Tue', date: 'Jan 14', emoji: '🥙', name: 'Lentil power bowl', description: 'Red lentils, brown rice, kale, lemon vinaigrette, seeds', protein: '26g', calories: 520, tags: ['Vegan', 'High protein'] },
    { day: 'Wed', date: 'Jan 15', emoji: '🌯', name: 'Egg bhurji wrap', description: '3 scrambled eggs, whole wheat wrap, avocado, sriracha', protein: '30g', calories: 430, tags: ['Vegetarian'] },
    { day: 'Thu', date: 'Jan 16', emoji: '🍱', name: 'Salmon teriyaki bowl', description: 'Grilled salmon, soba noodles, edamame, sesame dressing', protein: '38g', calories: 510, tags: ['High protein'] },
    { day: 'Fri', date: 'Jan 17', emoji: '🥬', name: 'Paneer tikka bowl', description: 'Grilled paneer, brown rice, roasted peppers, mint chutney', protein: '32g', calories: 480, tags: ['Vegetarian', 'High protein'] },
  ],
  'desi-dhaba': [
    { day: 'Mon', date: 'Jan 13', emoji: '🌿', name: 'Sarson da saag', description: 'Mustard greens, makki roti, white butter, jaggery', protein: '18g', calories: 480, tags: ['Vegetarian'] },
    { day: 'Tue', date: 'Jan 14', emoji: '🍗', name: 'Amritsari murgh', description: 'Punjabi-style chicken curry, roti, salad, lassi', protein: '39g', calories: 560, tags: ['Halal'] },
    { day: 'Wed', date: 'Jan 15', emoji: '🫘', name: 'Rajma chawal', description: 'Kidney bean curry, basmati rice, papad, pickle', protein: '22g', calories: 550, tags: ['Vegetarian'] },
    { day: 'Thu', date: 'Jan 16', emoji: '🥩', name: 'Mutton roghan josh', description: 'Slow-cooked mutton, Kashmiri spices, roti, raita', protein: '44g', calories: 620, tags: ['Halal', 'High protein'] },
    { day: 'Fri', date: 'Jan 17', emoji: '🧀', name: 'Paneer lababdar', description: 'Rich paneer gravy, butter naan, dal makhani, salad', protein: '26g', calories: 700, tags: ['Vegetarian'] },
  ],
};

export type WeekMeal = {
  day: string;
  date: string;
  emoji: string;
  name: string;
  description: string;
  protein: string;
  calories: number;
  tags: string[];
};

export const CATEGORIES = ['All', 'Halal', 'Vegetarian', 'High protein', 'Tiffin', 'Restaurant'];

export const DELIVERY_SLOTS = ['12:00pm – 1:00pm', '6:00pm – 7:00pm'];

// Get today's day name
export function getTodayMeal(kitchenId: string): WeekMeal | null {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = days[new Date().getDay()];
  const meals = WEEKLY_MEALS[kitchenId] ?? [];
  return meals.find(m => m.day === today) ?? meals[0] ?? null;
}

// Check if past cutoff (8pm)
export function isPastCutoff(): boolean {
  return new Date().getHours() >= 20;
}

// Hours until cutoff
export function hoursUntilCutoff(): number {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(20, 0, 0, 0);
  if (now >= cutoff) return 0;
  return Math.floor((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60));
}
