// Campus Data Fallback & Seeds
export const DEFAULT_RESTAURANTS = [
  {
    id: "local-home-kitchen",
    name: "Local Home Kitchen",
    description: "Authentic Homestyle South Indian Meals, Spicy Biryanis & Curries in Neerukonda Village.",
    cuisine: "Fast Food & Biryani",
    location: "Beside Ayyappa PG Hostel, Neerukonda",
    phone: "9989955833",
    rating: 4.8,
    prep_time: "15-20 min",
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
    is_open: true
  },
  {
    id: "campus-delight-dhaba",
    name: "Campus Delight Kitchen",
    description: "North Indian Specialties, Thalis, Fresh Rotis & Snacks at Campus Main Gate.",
    cuisine: "North Indian, Thalis & Rotis",
    location: "Opposite University South Gate, Neerukonda",
    phone: "9848022338",
    rating: 4.6,
    prep_time: "15-25 min",
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
    is_open: true
  }
];

export const DEFAULT_MENU_ITEMS = [
  // Local Home Kitchen
  { id: "lhk-cb-1", restaurant_id: "local-home-kitchen", category: "Biryani", name: "Chicken Dum Biryani", price: 170, is_veg: false, description: "Aromatic basmati rice with tender chicken & spices" },
  { id: "lhk-cb-2", restaurant_id: "local-home-kitchen", category: "Biryani", name: "Chicken Fry Biryani", price: 190, is_veg: false, description: "Special biryani rice with crispy chicken fry" },
  { id: "lhk-cb-3", restaurant_id: "local-home-kitchen", category: "Biryani", name: "Chicken Boneless Biryani", price: 240, is_veg: false, description: "Flavorful biryani with soft boneless chicken" },
  { id: "lhk-cb-4", restaurant_id: "local-home-kitchen", category: "Biryani", name: "Chicken 65 Biryani", price: 220, is_veg: false, description: "Classic biryani paired with Chicken 65" },
  { id: "lhk-cb-7", restaurant_id: "local-home-kitchen", category: "Biryani", name: "Mushroom Biryani", price: 220, is_veg: true, description: "Fresh button mushrooms tossed in herbs" },
  { id: "lhk-cb-9", restaurant_id: "local-home-kitchen", category: "Biryani", name: "Paneer Biryani", price: 220, is_veg: true, description: "Soft paneer cubes tossed in rich spices" },
  { id: "lhk-sv-1", restaurant_id: "local-home-kitchen", category: "Starters", name: "Veg Manchurian", price: 80, is_veg: true, description: "Golden vegetable dumplings in garlic gravy" },
  { id: "lhk-sc-2", restaurant_id: "local-home-kitchen", category: "Starters", name: "Chicken 65", price: 200, is_veg: false, description: "Spicy curry leaf fried chicken" },
  { id: "lhk-sc-3", restaurant_id: "local-home-kitchen", category: "Starters", name: "Chilli Chicken", price: 200, is_veg: false, description: "Diced chicken tossed with capsicum & soy" },
  { id: "lhk-fr-1", restaurant_id: "local-home-kitchen", category: "Rice & Noodles", name: "Chicken Fried Rice", price: 120, is_veg: false, description: "Wok-tossed rice with shredded chicken & egg" },
  { id: "lhk-fr-5", restaurant_id: "local-home-kitchen", category: "Rice & Noodles", name: "Veg Fried Rice", price: 80, is_veg: true, description: "Stir-fried rice with fine chopped veggies" },
  { id: "lhk-nd-1", restaurant_id: "local-home-kitchen", category: "Rice & Noodles", name: "Chicken Hakka Noodles", price: 120, is_veg: false, description: "Hakka noodles stir-fried with chicken" },

  // Campus Delight Dhaba
  { id: "cd-cur-1", restaurant_id: "campus-delight-dhaba", category: "Curries", name: "Paneer Butter Masala", price: 180, is_veg: true, description: "Rich tomato & cashew nut gravy with paneer" },
  { id: "cd-cur-2", restaurant_id: "campus-delight-dhaba", category: "Curries", name: "Dal Tadka Dhaba Style", price: 110, is_veg: true, description: "Yellow lentils tempered with ghee & cumin" },
  { id: "cd-cur-3", restaurant_id: "campus-delight-dhaba", category: "Curries", name: "Butter Chicken Masala", price: 210, is_veg: false, description: "Tandoori chicken in silky butter sauce" },
  { id: "cd-rot-1", restaurant_id: "campus-delight-dhaba", category: "Breads", name: "Butter Naan (2 pcs)", price: 60, is_veg: true, description: "Fresh clay-tandoor flatbread with butter" },
  { id: "cd-rot-2", restaurant_id: "campus-delight-dhaba", category: "Breads", name: "Tandoori Roti (3 pcs)", price: 45, is_veg: true, description: "Healthy whole wheat tandoor flatbread" },
  { id: "cd-tha-1", restaurant_id: "campus-delight-dhaba", category: "Thalis", name: "Executive Veg Thali", price: 160, is_veg: true, description: "Paneer, Dal, 2 Rotis, Rice, Curd, Sweet" },
  { id: "cd-tha-2", restaurant_id: "campus-delight-dhaba", category: "Thalis", name: "Deluxe Chicken Thali", price: 220, is_veg: false, description: "Chicken curry, Egg fry, 2 Rotis, Rice, Salad" },
  { id: "cd-bev-1", restaurant_id: "campus-delight-dhaba", category: "Beverages", name: "Sweet Punjabi Lassi", price: 50, is_veg: true, description: "Chilled churned yogurt drink with malai" }
];
