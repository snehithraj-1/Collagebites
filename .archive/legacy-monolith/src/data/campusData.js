// Data models and authentic seed data for Campus Food Ordering Platform

export const RESTAURANTS = [
  {
    id: "local-home-kitchen",
    name: "Local Home Kitchen",
    cuisine: "Fast Food and Biryani",
    location: "Neerukonda Village",
    landmark: "Beside Ayyappa PG Hostel, Neerukonda",
    phone: "9989955833",
    rating: 4.8,
    reviewsCount: "820+",
    prepTime: "15-20 min",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
    badge: "Popular Campus Spot 🔥",
    defaultStatus: "OPEN"
  },
  {
    id: "campus-delight-dhaba",
    name: "Campus Delight Kitchen",
    cuisine: "North Indian, Thalis & Beverages",
    location: "Campus Main Road, Neerukonda",
    landmark: "Opposite University South Gate, Neerukonda",
    phone: "9848022338",
    rating: 4.6,
    reviewsCount: "540+",
    prepTime: "15-25 min",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
    badge: "Configurable Partner 🍛",
    defaultStatus: "OPEN"
  }
];

// Exact Menu Items for Local Home Kitchen
export const LOCAL_HOME_KITCHEN_MENU = [
  // 1. CHICKEN BIRYANI
  { id: "lhk-cb-1", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Chicken Dum Biryani", price: 170, isVeg: false, portion: "Single" },
  { id: "lhk-cb-2", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Chicken Fry Biryani", price: 190, isVeg: false, portion: "Single" },
  { id: "lhk-cb-3", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Chicken Boneless Biryani", price: 240, isVeg: false, portion: "Single" },
  { id: "lhk-cb-4", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Chicken 65 Biryani", price: 220, isVeg: false, portion: "Single" },
  { id: "lhk-cb-5", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Chicken Lolipop Biryani", price: 250, isVeg: false, portion: "Single" },
  { id: "lhk-cb-6", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Chicken Majbai Biryani", price: 250, isVeg: false, portion: "Single" },
  { id: "lhk-cb-7", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Mushroom Biryani", price: 220, isVeg: true, portion: "Single" },
  { id: "lhk-cb-8", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Kaju Mushroom Biryani", price: 250, isVeg: true, portion: "Single" },
  { id: "lhk-cb-9", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Paneer Biryani", price: 220, isVeg: true, portion: "Single" },
  { id: "lhk-cb-10", restaurantId: "local-home-kitchen", category: "Chicken Biryani", name: "Kaju Chicken Biryani", price: 220, isVeg: false, portion: "Single" },

  // 2. STARTERS - VEG
  { id: "lhk-sv-1", restaurantId: "local-home-kitchen", category: "Starters - Veg", name: "Veg Manchurian", price: 80, isVeg: true },
  { id: "lhk-sv-2", restaurantId: "local-home-kitchen", category: "Starters - Veg", name: "Paneer Manchurian", price: 180, isVeg: true },
  { id: "lhk-sv-3", restaurantId: "local-home-kitchen", category: "Starters - Veg", name: "Paneer Majestic", price: 200, isVeg: true },
  { id: "lhk-sv-4", restaurantId: "local-home-kitchen", category: "Starters - Veg", name: "Kaju Paneer Manchuria", price: 210, isVeg: true },
  { id: "lhk-sv-5", restaurantId: "local-home-kitchen", category: "Starters - Veg", name: "Mushroom Manchuria", price: 180, isVeg: true },
  { id: "lhk-sv-6", restaurantId: "local-home-kitchen", category: "Starters - Veg", name: "Kaju Mushroom Manchuria", price: 210, isVeg: true },

  // 3. STARTERS - CHICKEN
  { id: "lhk-sc-1", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Chicken Manchuria", price: 180, isVeg: false },
  { id: "lhk-sc-2", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Chicken 65", price: 200, isVeg: false },
  { id: "lhk-sc-3", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Chilli Chicken", price: 200, isVeg: false },
  { id: "lhk-sc-4", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Chicken Kaju Manchuria", price: 210, isVeg: false },
  { id: "lhk-sc-5", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Chicken Majestic", price: 220, isVeg: false },
  { id: "lhk-sc-6", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Kaju Chilli Chicken", price: 220, isVeg: false },
  { id: "lhk-sc-7", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Pepper Chicken", price: 230, isVeg: false },
  { id: "lhk-sc-8", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Lemon Chicken", price: 230, isVeg: false },
  { id: "lhk-sc-9", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "Chicken Lolipop", price: 250, isVeg: false },
  { id: "lhk-sc-10", restaurantId: "local-home-kitchen", category: "Starters - Chicken", name: "KFC Chicken Lolipop", price: 300, isVeg: false },

  // 4. VEG BIRYANI
  { id: "lhk-vb-1", restaurantId: "local-home-kitchen", category: "Veg Biryani", name: "Veg Biryani", price: 150, isVeg: true },
  { id: "lhk-vb-2", restaurantId: "local-home-kitchen", category: "Veg Biryani", name: "Paneer Biryani", price: 210, isVeg: true },
  { id: "lhk-vb-3", restaurantId: "local-home-kitchen", category: "Veg Biryani", name: "Cashew Biryani", price: 220, isVeg: true },
  { id: "lhk-vb-4", restaurantId: "local-home-kitchen", category: "Veg Biryani", name: "Cashew and Paneer Mixed Biryani", price: 240, isVeg: true },

  // 5. FRIED RICE
  { id: "lhk-fr-1", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Chicken Fried Rice", price: 120, isVeg: false },
  { id: "lhk-fr-2", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Chicken Fried Rice White", price: 130, isVeg: false },
  { id: "lhk-fr-3", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Double Egg Chicken Fried Rice", price: 130, isVeg: false },
  { id: "lhk-fr-4", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Kaju Chicken Fried Rice", price: 160, isVeg: false },
  { id: "lhk-fr-5", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Veg Fried Rice", price: 80, isVeg: true },
  { id: "lhk-fr-6", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Veg Fried Rice White", price: 110, isVeg: true },
  { id: "lhk-fr-7", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Double Egg Fried Rice", price: 110, isVeg: false },
  { id: "lhk-fr-8", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Egg Fried Rice", price: 120, isVeg: false },
  { id: "lhk-fr-9", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Double Egg Manchuria Rice", price: 120, isVeg: false },
  { id: "lhk-fr-10", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Veg Fried Rice White (Small)", price: 90, isVeg: true },
  { id: "lhk-fr-11", restaurantId: "local-home-kitchen", category: "Fried Rice", name: "Veg Manchuria Fried Rice", price: 120, isVeg: true },

  // 6. NOODLES
  { id: "lhk-nd-1", restaurantId: "local-home-kitchen", category: "Noodles", name: "Chicken Noodles", price: 120, isVeg: false },
  { id: "lhk-nd-2", restaurantId: "local-home-kitchen", category: "Noodles", name: "Chicken Noodles White", price: 130, isVeg: false },
  { id: "lhk-nd-3", restaurantId: "local-home-kitchen", category: "Noodles", name: "Double Egg Chicken Noodles", price: 130, isVeg: false },
  { id: "lhk-nd-4", restaurantId: "local-home-kitchen", category: "Noodles", name: "Kaju Chicken Noodles", price: 160, isVeg: false },
  { id: "lhk-nd-5", restaurantId: "local-home-kitchen", category: "Noodles", name: "Veg Noodles", price: 80, isVeg: true },
  { id: "lhk-nd-6", restaurantId: "local-home-kitchen", category: "Noodles", name: "Veg Noodles White", price: 100, isVeg: true },
  { id: "lhk-nd-7", restaurantId: "local-home-kitchen", category: "Noodles", name: "Egg Manchurian Noodles", price: 120, isVeg: false },
  { id: "lhk-nd-8", restaurantId: "local-home-kitchen", category: "Noodles", name: "Double Egg Noodles", price: 120, isVeg: false },
  { id: "lhk-nd-9", restaurantId: "local-home-kitchen", category: "Noodles", name: "Veg Manchurian Noodles", price: 120, isVeg: true },
  { id: "lhk-nd-10", restaurantId: "local-home-kitchen", category: "Noodles", name: "Kaju Noodles", price: 120, isVeg: true },
  { id: "lhk-nd-11", restaurantId: "local-home-kitchen", category: "Noodles", name: "Kaju Manchuria Noodles", price: 140, isVeg: true },
  { id: "lhk-nd-12", restaurantId: "local-home-kitchen", category: "Noodles", name: "Kaju Manchurian Noodles White", price: 160, isVeg: true },

  // 7. PANEER ITEMS
  { id: "lhk-pi-1", restaurantId: "local-home-kitchen", category: "Paneer Items", name: "Paneer Fried Rice", price: 150, isVeg: true },
  { id: "lhk-pi-2", restaurantId: "local-home-kitchen", category: "Paneer Items", name: "Paneer Noodles", price: 150, isVeg: true },

  // 8. MUSHROOM ITEMS
  { id: "lhk-mi-1", restaurantId: "local-home-kitchen", category: "Mushroom Items", name: "Mushroom Fried Rice", price: 150, isVeg: true },
  { id: "lhk-mi-2", restaurantId: "local-home-kitchen", category: "Mushroom Items", name: "Mushroom Noodles", price: 150, isVeg: true },

  // 9. SCHEZWAN ITEMS
  { id: "lhk-sz-1", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Veg Schezwan Fried Rice", price: 120, isVeg: true },
  { id: "lhk-sz-2", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Egg Schezwan Fried Rice", price: 140, isVeg: false },
  { id: "lhk-sz-3", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Manchurian Schezwan Fried Rice", price: 160, isVeg: true },
  { id: "lhk-sz-4", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Schezwan Chicken Fried Rice", price: 170, isVeg: false },
  { id: "lhk-sz-5", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Veg Schezwan Noodles", price: 120, isVeg: true },
  { id: "lhk-sz-6", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Egg Schezwan Noodles", price: 140, isVeg: false },
  { id: "lhk-sz-7", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Manchurian Schezwan Noodles", price: 160, isVeg: true },
  { id: "lhk-sz-8", restaurantId: "local-home-kitchen", category: "Schezwan Items", name: "Schezwan Chicken Noodles", price: 170, isVeg: false },

  // 10. SPECIAL ITEMS
  { id: "lhk-sp-1", restaurantId: "local-home-kitchen", category: "Special Items", name: "SP Chicken Fried Rice", price: 140, isVeg: false },
  { id: "lhk-sp-2", restaurantId: "local-home-kitchen", category: "Special Items", name: "SP Chicken Noodles", price: 140, isVeg: false },
  { id: "lhk-sp-3", restaurantId: "local-home-kitchen", category: "Special Items", name: "SP Paneer Fried Rice", price: 180, isVeg: true },
  { id: "lhk-sp-4", restaurantId: "local-home-kitchen", category: "Special Items", name: "SP Paneer Noodles", price: 180, isVeg: true },
  { id: "lhk-sp-5", restaurantId: "local-home-kitchen", category: "Special Items", name: "SP Mushroom Fried Rice", price: 180, isVeg: true },
  { id: "lhk-sp-6", restaurantId: "local-home-kitchen", category: "Special Items", name: "SP Mushroom Noodles", price: 180, isVeg: true }
];

// Configurable Template Menu for Second Restaurant
export const SECOND_RESTAURANT_MENU = [
  { id: "cd-th-1", restaurantId: "campus-delight-dhaba", category: "Thalis & Meals", name: "Special North Indian Veg Thali", price: 160, isVeg: true, portion: "Full Plate" },
  { id: "cd-th-2", restaurantId: "campus-delight-dhaba", category: "Thalis & Meals", name: "Chicken Curry Meal Thali", price: 190, isVeg: false, portion: "Full Plate" },
  { id: "cd-cur-1", restaurantId: "campus-delight-dhaba", category: "Curries & Dal", name: "Paneer Butter Masala", price: 180, isVeg: true },
  { id: "cd-cur-2", restaurantId: "campus-delight-dhaba", category: "Curries & Dal", name: "Dal Makhani", price: 140, isVeg: true },
  { id: "cd-cur-3", restaurantId: "campus-delight-dhaba", category: "Curries & Dal", name: "Kadai Chicken", price: 210, isVeg: false },
  { id: "cd-br-1", restaurantId: "campus-delight-dhaba", category: "Rotis & Breads", name: "Butter Tandoori Roti (2 Pcs)", price: 40, isVeg: true },
  { id: "cd-br-2", restaurantId: "campus-delight-dhaba", category: "Rotis & Breads", name: "Butter Naan (1 Pc)", price: 50, isVeg: true },
  { id: "cd-bev-1", restaurantId: "campus-delight-dhaba", category: "Drinks & Shakes", name: "Sweet Punjabi Lassi", price: 60, isVeg: true },
  { id: "cd-bev-2", restaurantId: "campus-delight-dhaba", category: "Drinks & Shakes", name: "Cold Badam Milk", price: 50, isVeg: true }
];

// Combine all menu items for easy lookup
export const ALL_MENU_ITEMS = [
  ...LOCAL_HOME_KITCHEN_MENU,
  ...SECOND_RESTAURANT_MENU
];

// Campus drop-off locations
export const CAMPUS_LOCATIONS = [
  { id: "block-a", name: "Hostel Block A (Boys)", landmark: "Near Security Gate" },
  { id: "block-b", name: "Hostel Block B (Boys)", landmark: "Main Reception Desk" },
  { id: "block-c", name: "Hostel Block C (Girls)", landmark: "Hostel Entrance" },
  { id: "block-d", name: "Hostel Block D (Girls)", landmark: "Security Point" },
  { id: "mab", name: "Main Academic Block (MAB)", landmark: "Ground Floor Foyer" },
  { id: "library", name: "Central Library Lawns", landmark: "Reading Hall Entrance" },
  { id: "neerukonda-pg", name: "Ayyappa PG Hostel, Neerukonda", landmark: "PG Gate" }
];

// Initial seed orders for admin dashboard demonstration
export const INITIAL_ORDERS = [
  {
    id: "ORD-9412",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    orderTimeFormatted: "45 mins ago",
    studentName: "Raj Snehith",
    studentId: "AP22110010482",
    studentPhone: "9989955833",
    restaurantId: "local-home-kitchen",
    restaurantName: "Local Home Kitchen",
    items: [
      { name: "Chicken Dum Biryani", qty: 1, price: 170 },
      { name: "Chicken 65", qty: 1, price: 200 }
    ],
    totalAmount: 370,
    deliveryLocation: "Hostel Block B (Boys), Room 412",
    status: "CONFIRMED" // CONFIRMED | CANCELLED | PENDING
  },
  {
    id: "ORD-8930",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    orderTimeFormatted: "2 hours ago",
    studentName: "Ananya Sharma",
    studentId: "AP22110010214",
    studentPhone: "9848011223",
    restaurantId: "local-home-kitchen",
    restaurantName: "Local Home Kitchen",
    items: [
      { name: "Veg Manchurian", qty: 1, price: 80 },
      { name: "Double Egg Chicken Fried Rice", qty: 1, price: 130 }
    ],
    totalAmount: 210,
    deliveryLocation: "Hostel Block C (Girls), Room 204",
    status: "CONFIRMED"
  },
  {
    id: "ORD-8711",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    orderTimeFormatted: "4 hours ago",
    studentName: "Karthik Verma",
    studentId: "AP22110010901",
    studentPhone: "9701234567",
    restaurantId: "campus-delight-dhaba",
    restaurantName: "Campus Delight Kitchen",
    items: [
      { name: "Special North Indian Veg Thali", qty: 1, price: 160 },
      { name: "Sweet Punjabi Lassi", qty: 1, price: 60 }
    ],
    totalAmount: 220,
    deliveryLocation: "Hostel Block A (Boys), Room 108",
    status: "CANCELLED"
  }
];
