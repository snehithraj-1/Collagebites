export const CAMPUS_INFO = {
  name: "CampusBites",
  originalBrand: "CLGBITES",
  campusName: "SRM University-AP (SRM-AP), Amaravati",
  tagline: "SRM-AP's Campus Food App — Delivered to your Hostel Door",
  supportPhone: "7842960252",
  supportPhoneFormatted: "+91 78429 60252",
  supportEmail: "clgbites@gmail.com",
  deliverySlot: "7:30 PM - 8:30 PM (Evening Dinner Slot)",
  disclaimer: "Unofficial UI/UX Redesign Concept for ClgBites. Created independently as a design and development demonstration. Not affiliated with or endorsed by any existing platform."
};

export const CAMPUS_LOCATIONS = [
  { id: "block-a", name: "Hostel Block A (Boys)", fee: 0, time: "15-20 min" },
  { id: "block-b", name: "Hostel Block B (Boys)", fee: 0, time: "15-20 min" },
  { id: "block-c", name: "Hostel Block C (Girls)", fee: 0, time: "15-25 min" },
  { id: "block-d", name: "Hostel Block D (Girls)", fee: 0, time: "15-25 min" },
  { id: "mab", name: "Main Academic Block (MAB)", fee: 0, time: "10-15 min" },
  { id: "library", name: "Central Library Lawns", fee: 0, time: "12-18 min" },
  { id: "dining-1", name: "Dining Hall 1 / Mess", fee: 0, time: "10-15 min" }
];

export const FOOD_CATEGORIES = [
  { id: "all", name: "All Dishes", icon: "✨" },
  { id: "biryani", name: "Biryani & Rice", icon: "🍗" },
  { id: "chinese", name: "Noodles & Chinese", icon: "🍜" },
  { id: "starters", name: "Starters & Curries", icon: "🥘" },
  { id: "fruits", name: "Fresh Fruits", icon: "🍎" },
  { id: "beverages", name: "Shakes & Chai", icon: "🥤" },
  { id: "desserts", name: "Desserts & Sweets", icon: "🍰" }
];

export const VENDORS = [
  {
    id: "hotel-bheemasena",
    name: "Hotel Bheemasena",
    tagline: "Authentic restaurant-style veg & non-veg biryanis",
    rating: 5.0,
    reviewsCount: "1.4k+",
    prepTime: "20-25 min",
    deliveryFee: "₹0 Free Delivery",
    minOrder: "₹100",
    banner: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80",
    badge: "Trending at SRM-AP 🔥",
    cuisine: "Dum Biryani, Butter Chicken, Starters",
    location: "Campus Dining Partner",
    bestItem: "Chicken Dum Biryani"
  },
  {
    id: "food-corner",
    name: "Food Corner",
    tagline: "Your go-to spot for quick Chinese & Fast Foods",
    rating: 4.8,
    reviewsCount: "980+",
    prepTime: "12-15 min",
    deliveryFee: "₹0 Free Delivery",
    minOrder: "₹60",
    banner: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=200&q=80",
    badge: "Student Favorite ⭐",
    cuisine: "Noodles, Fried Rice, Manchurian, Fast Food",
    location: "Beside Hostel Complex",
    bestItem: "Chicken Noodles"
  },
  {
    id: "A1Biryani",
    name: "A1 Biryani",
    tagline: "Gaining popularity flavorful campus biryanis",
    rating: 4.9,
    reviewsCount: "650+",
    prepTime: "15-20 min",
    deliveryFee: "₹0 Free Delivery",
    minOrder: "₹99",
    banner: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=200&q=80",
    badge: "Bestseller Value 🏆",
    cuisine: "Hyderabadi Biryani, Fry Biryani, Mixed Biryani",
    location: "SRM-AP Food Street",
    bestItem: "Dum Biryani"
  },
  {
    id: "fruits",
    name: "Fruit Market",
    tagline: "Fresh seasonal fruits available daily at market rates",
    rating: 4.7,
    reviewsCount: "420+",
    prepTime: "10 min",
    deliveryFee: "₹0 Free Delivery",
    minOrder: "₹50",
    banner: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=200&q=80",
    badge: "Healthy & Fresh 🍎",
    cuisine: "Pomegranate, Apples, Dragon Fruit, Grapes",
    location: "Daily Fresh Stalls",
    bestItem: "Pomegranate 500g"
  },
  {
    id: "caffeine-lab",
    name: "The Caffeine Lab & Shakes",
    tagline: "Cold Brews, Thick Shakes & Refreshers",
    rating: 4.8,
    reviewsCount: "740+",
    prepTime: "8-12 min",
    deliveryFee: "₹0 Free Delivery",
    minOrder: "₹50",
    banner: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=1200&q=80",
    logo: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=200&q=80",
    badge: "Midnight Fuel 🌙",
    cuisine: "Oreo Shakes, Cold Coffee, Cutting Chai",
    location: "Central Courtyard",
    bestItem: "Thick Oreo Blast"
  }
];

export const FOOD_ITEMS = [
  // Hotel Bheemasena
  {
    id: "food-1",
    name: "Chicken Dum Biryani",
    vendorId: "hotel-bheemasena",
    vendorName: "Hotel Bheemasena",
    category: "biryani",
    isVeg: false,
    price: 290,
    rating: 4.9,
    reviews: "680+",
    prepTime: "20 min",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    description: "Signature slow-cooked fragrant basmati rice layered with succulent chicken pieces, caramelized onions, and authentic spices. Served with raita and spicy salan.",
    ingredients: "Basmati Rice, Marinated Chicken, Saffron, Fried Onions, Ghee, Secret Spices",
    isBestseller: true,
    isPopularNearYou: true
  },
  {
    id: "food-2",
    name: "Chilli Chicken",
    vendorId: "hotel-bheemasena",
    vendorName: "Hotel Bheemasena",
    category: "starters",
    isVeg: false,
    price: 310,
    rating: 4.8,
    reviews: "450+",
    prepTime: "15 min",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80",
    description: "Crispy battered chicken tossed with spicy green chilies, crunchy capsicum, sliced onions, and dark soya garlic sauce.",
    ingredients: "Boneless Chicken, Capsicum, Green Chilies, Garlic, Soya Sauce",
    isBestseller: true,
    isPopularNearYou: true
  },
  {
    id: "food-3",
    name: "Special Paneer Biryani",
    vendorId: "hotel-bheemasena",
    vendorName: "Hotel Bheemasena",
    category: "biryani",
    isVeg: true,
    price: 310,
    rating: 4.7,
    reviews: "320+",
    prepTime: "20 min",
    image: "https://images.unsplash.com/photo-1642821373181-696a54913e9a?auto=format&fit=crop&w=800&q=80",
    description: "Tender cubes of cottage cheese marinated in spiced yogurt and layered with aromatic long-grain basmati rice.",
    ingredients: "Fresh Paneer, Basmati Rice, Spices, Mint, Raita",
    isBestseller: false,
    isPopularNearYou: true
  },
  {
    id: "food-4",
    name: "Butter Chicken",
    vendorId: "hotel-bheemasena",
    vendorName: "Hotel Bheemasena",
    category: "starters",
    isVeg: false,
    price: 310,
    rating: 4.9,
    reviews: "510+",
    prepTime: "18 min",
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80",
    description: "Tender grilled tandoori chicken simmered in a velvety, buttery tomato cashew gravy finished with fresh cream and dried fenugreek.",
    ingredients: "Chicken, Butter, Cashew Paste, Cream, Tomato Puree, Kasuri Methi",
    isBestseller: true,
    isPopularNearYou: false
  },
  {
    id: "food-5",
    name: "Butter Naan",
    vendorId: "hotel-bheemasena",
    vendorName: "Hotel Bheemasena",
    category: "starters",
    isVeg: true,
    price: 55,
    rating: 4.8,
    reviews: "380+",
    prepTime: "8 min",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
    description: "Soft, pillowy Indian flatbread freshly baked in tandoor and brushed generously with salted butter.",
    ingredients: "Flour, Yeast, Butter, Nigella Seeds",
    isBestseller: false,
    isPopularNearYou: false
  },

  // Food Corner
  {
    id: "food-6",
    name: "Chicken Noodles",
    vendorId: "food-corner",
    vendorName: "Food Corner",
    category: "chinese",
    isVeg: false,
    price: 140,
    rating: 4.8,
    reviews: "820+",
    prepTime: "12 min",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=800&q=80",
    description: "Wok-tossed Hakka noodles with shredded seasoned chicken, cabbage, carrots, bell peppers, and savoury Chinese seasonings.",
    ingredients: "Noodles, Shredded Chicken, Cabbage, Soya Sauce, Spring Onions",
    isBestseller: true,
    isPopularNearYou: true
  },
  {
    id: "food-7",
    name: "Veg Manchurian",
    vendorId: "food-corner",
    vendorName: "Food Corner",
    category: "chinese",
    isVeg: true,
    price: 110,
    rating: 4.7,
    reviews: "640+",
    prepTime: "12 min",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
    description: "Crispy vegetable balls tossed in ginger, garlic, chopped chili, and rich umami Manchurian gravy.",
    ingredients: "Minced Vegetables, Cornstarch, Garlic, Soya Sauce, Chili Sauce",
    isBestseller: true,
    isPopularNearYou: true
  },
  {
    id: "food-8",
    name: "Double Egg Chicken Fried Rice",
    vendorId: "food-corner",
    vendorName: "Food Corner",
    category: "chinese",
    isVeg: false,
    price: 150,
    rating: 4.8,
    reviews: "530+",
    prepTime: "12 min",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80",
    description: "Aromatic steamed rice wok-fried with double scrambled eggs, tender chicken chunks, carrots, and scallions.",
    ingredients: "Steamed Rice, 2 Eggs, Chicken Chunks, Spring Onions, Pepper",
    isBestseller: true,
    isPopularNearYou: false
  },
  {
    id: "food-9",
    name: "4P Chicken Lollipop",
    vendorId: "food-corner",
    vendorName: "Food Corner",
    category: "chinese",
    isVeg: false,
    price: 180,
    rating: 4.9,
    reviews: "490+",
    prepTime: "15 min",
    image: "https://images.unsplash.com/photo-1527477378377-f2777498305c?auto=format&fit=crop&w=800&q=80",
    description: "Four succulent Frenched chicken winglets marinated in fiery red spices and fried to crisp perfection. Served with Schezwan dip.",
    ingredients: "Chicken Wings, Cornflour, Garlic Ginger Paste, Schezwan Sauce",
    isBestseller: false,
    isPopularNearYou: false
  },

  // A1 Biryani
  {
    id: "food-10",
    name: "A1 Dum Biryani",
    vendorId: "A1Biryani",
    vendorName: "A1 Biryani",
    category: "biryani",
    isVeg: false,
    price: 200,
    rating: 4.8,
    reviews: "410+",
    prepTime: "15 min",
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80",
    description: "Classic student favorite Dum Biryani with spiced chicken pieces and fragrant yellow basmati rice at an unbeatable campus price.",
    ingredients: "Basmati Rice, Chicken, Brown Onions, Ghee, Raita",
    isBestseller: true,
    isPopularNearYou: true
  },
  {
    id: "food-11",
    name: "A1 Mixed Biryani",
    vendorId: "A1Biryani",
    vendorName: "A1 Biryani",
    category: "biryani",
    isVeg: false,
    price: 230,
    rating: 4.9,
    reviews: "390+",
    prepTime: "18 min",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
    description: "Combination of tender chicken fry pieces and seasoned egg served on top of piping hot biryani rice.",
    ingredients: "Chicken Fry, Egg, Dum Rice, Mint, Lemon, Salan",
    isBestseller: true,
    isPopularNearYou: true
  },

  // Fruit Market
  {
    id: "food-12",
    name: "Fresh Pomegranate 500g",
    vendorId: "fruits",
    vendorName: "Fruit Market",
    category: "fruits",
    isVeg: true,
    price: 185,
    rating: 4.7,
    reviews: "260+",
    prepTime: "8 min",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
    description: "Freshly selected, ruby red sweet pomegranate arils, packed with antioxidants. Delivered straight to your hostel.",
    ingredients: "100% Fresh Pomegranate",
    isBestseller: true,
    isPopularNearYou: false
  },
  {
    id: "food-13",
    name: "Crisp Royal Apples 500g",
    vendorId: "fruits",
    vendorName: "Fruit Market",
    category: "fruits",
    isVeg: true,
    price: 160,
    rating: 4.6,
    reviews: "180+",
    prepTime: "8 min",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
    description: "Sweet, crunchy imported apples handpicked and sanitized. Perfect healthy snack for study breaks.",
    ingredients: "100% Fresh Apples",
    isBestseller: false,
    isPopularNearYou: false
  },

  // The Caffeine Lab & Shakes
  {
    id: "food-14",
    name: "Thick Oreo Blast Milkshake",
    vendorId: "caffeine-lab",
    vendorName: "The Caffeine Lab & Shakes",
    category: "beverages",
    isVeg: true,
    price: 90,
    rating: 4.9,
    reviews: "670+",
    prepTime: "8 min",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
    description: "Rich whole milk blended with crushed Oreo cookies, rich chocolate syrup, and crowned with vanilla ice cream and cookie crumbs.",
    ingredients: "Oreo Biscuits, Full Cream Milk, Chocolate Ganache, Vanilla Scoop",
    isBestseller: true,
    isPopularNearYou: true
  },
  {
    id: "food-15",
    name: "Classic Iced Cold Coffee",
    vendorId: "caffeine-lab",
    vendorName: "The Caffeine Lab & Shakes",
    category: "beverages",
    isVeg: true,
    price: 70,
    rating: 4.7,
    reviews: "450+",
    prepTime: "6 min",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80",
    description: "Freshly brewed espresso shaken with chilled milk, sugar, and crushed ice for that instant study alertness.",
    ingredients: "Espresso Shots, Chilled Milk, Raw Sugar, Froth",
    isBestseller: true,
    isPopularNearYou: false
  }
];

export const STUDENT_TESTIMONIALS = [
  {
    name: "Nikhil R.",
    block: "B-Block",
    stars: 5,
    text: "Hotel Bheemasena's biryani hits different at 9pm. Fast and always hot!"
  },
  {
    name: "Swetha P.",
    block: "A-Hostel",
    stars: 5,
    text: "CLGBITES is so easy to use. Food Corner noodles are always fresh!"
  },
  {
    name: "Rohit K.",
    block: "C-Block",
    stars: 4,
    text: "A1 Biryani mixed biryani is proper value for money. Loved it."
  },
  {
    name: "Anjali M.",
    block: "D-Hostel",
    stars: 5,
    text: "Ordering is genius — no password needed. Fruit Market delivers same day!"
  },
  {
    name: "Sai T.",
    block: "A-Block",
    stars: 5,
    text: "Hotel Bheemasena butter chicken is 10/10. Ordered twice this week!"
  }
];

export const STUDENT_PROFILE = {
  name: "Raj",
  rollNo: "AP22110010482",
  email: "rajsrmap2@gmail.com",
  phone: "7842960252",
  campus: "SRM University-AP, Amaravati",
  defaultLocation: "Hostel Block B (Boys)",
  roomNumber: "Room 412",
  savedLocations: [
    { title: "Hostel Room", address: "Block B, Room 412, SRM-AP" },
    { title: "Library", address: "Central Library, 2nd Floor Reading Hall" },
    { title: "Lab", address: "AL & ML Lab, Academic Block" }
  ]
};

export const PROMO_COUPONS = [
  { code: "CAMPUS50", discountPercent: 50, maxDiscount: 100, minOrder: 149, description: "50% OFF up to ₹100 for campus students" },
  { code: "SRMFEAST", discountFlat: 40, minOrder: 120, description: "Flat ₹40 OFF on all food orders" },
  { code: "FREEDEL", discountDelivery: true, minOrder: 0, description: "Free campus doorstep delivery" }
];

export const INITIAL_PAST_ORDERS = [
  {
    id: "CB-8924",
    date: "Yesterday, 8:45 PM",
    vendorName: "Hotel Bheemasena",
    vendorId: "hotel-bheemasena",
    status: "Delivered",
    items: [
      { name: "Chicken Dum Biryani", qty: 1, price: 290 },
      { name: "Thick Oreo Blast Milkshake", qty: 1, price: 90 }
    ],
    total: 380,
    deliveredTo: "Hostel Block B, Room 412"
  },
  {
    id: "CB-8412",
    date: "05 Sep, 8:15 PM",
    vendorName: "Food Corner",
    vendorId: "food-corner",
    status: "Delivered",
    items: [
      { name: "Chicken Noodles", qty: 1, price: 140 },
      { name: "Veg Manchurian", qty: 1, price: 110 }
    ],
    total: 250,
    deliveredTo: "Hostel Block B, Room 412"
  }
];
