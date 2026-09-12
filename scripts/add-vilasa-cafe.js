import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

let dbUrl = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) dbUrl = match[1].trim();
}

export const VILASA_RESTAURANT = {
  id: "vilasa-cafe",
  name: "Vilasa Café",
  description: "High on life! Taste • Talks • Time — Fresh Biryanis, Starters, Chinese & Curries.",
  cuisine: "Biryani, Starters & Chinese",
  location: "Opp SRM University, E12 Road • Neerukonda, Amaravathi",
  phone: "9989955833",
  rating: 4.8,
  prep_time: "15-20 min",
  image_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  is_open: true
};

export const VILASA_MENU_ITEMS = [
  // ==========================================
  // 1. VEG STARTERS
  // ==========================================
  {
    id: "vc-vs-veg-manchuria",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Starters",
    name: "Veg Manchuria",
    description: "Crispy fried mixed vegetable dumplings tossed in tangy Chinese garlic manchurian sauce.",
    price: 120,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vs-paneer-manchuria",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Starters",
    name: "Paneer Manchuria",
    description: "Golden paneer cubes tossed in rich ginger-garlic manchurian glaze with green onions.",
    price: 210,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vs-paneer-chilli",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Starters",
    name: "Paneer Chilli",
    description: "Wok-tossed paneer cubes with crunchy bell peppers, diced onions and dark soy-chilli gravy.",
    price: 240,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vs-paneer-65",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Starters",
    name: "Paneer 65",
    description: "Spicy South Indian style deep-fried paneer tempered with curry leaves, mustard seeds & yogurt.",
    price: 240,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vs-paneer-majestic",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Starters",
    name: "Paneer Majestic",
    description: "Royal Hyderabadi paneer strips sauteed with mint, coriander, curd, and mild aromatic spices.",
    price: 260,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 2. EGG STARTERS
  // ==========================================
  {
    id: "vc-es-egg-manchuria",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Egg Starters",
    name: "Egg Manchuria",
    description: "Crispy battered hard-boiled egg chunks tossed in savory garlic and soy manchurian sauce.",
    price: 130,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-es-double-egg-manchuria",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Egg Starters",
    name: "Double Egg Manchuria",
    description: "Extra portion of crispy egg bites smothered in zesty scallion manchurian gravy.",
    price: 150,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-es-egg-chilli",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Egg Starters",
    name: "Egg Chilli",
    description: "Egg pieces stir-fried with hot green chillies, capsicum, and oriental sauces.",
    price: 220,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-es-egg-65",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Egg Starters",
    name: "Egg 65",
    description: "Crunchy fried egg bites tossed in classic spicy curd tempering with crispy curry leaves.",
    price: 220,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-es-omlet",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Egg Starters",
    name: "Omlet",
    description: "Classic pan-fried fluffy 2-egg omelette loaded with diced onions, green chillies and black pepper.",
    price: 80,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 3. NON-VEG STARTERS
  // ==========================================
  {
    id: "vc-nvs-guntur-chilli-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Guntur Chilli Chicken (Bone)",
    description: "Fiery Andhra style bone-in chicken braised with spicy Guntur red chillies and roasted spices.",
    price: 190,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chk-manchuria",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chicken Manchuria",
    description: "Crispy chicken meatballs sauteed with garlic, ginger, green chillies and soy sauce.",
    price: 210,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chilli-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chilli Chicken",
    description: "Classic Indo-Chinese diced chicken tossed with crunchy onions, capsicum & spicy chilli sauce.",
    price: 210,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chk-65",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chicken 65",
    description: "All-time favorite spicy deep-fried chicken cubes tossed with curry leaves, yogurt & green chillies.",
    price: 210,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-garlic-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Garlic Chicken",
    description: "Tender chicken pieces glazed with aromatic roasted garlic, scallions and cracked peppercorn.",
    price: 250,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chk-majestic",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chicken Majestic",
    description: "Dry and crispy chicken strips infused with mint, buttermilk tempering, and Andhra spices.",
    price: 250,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-dragon-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Dragon Chicken",
    description: "Batter-coated chicken strips tossed in a fiery red sweet & spicy sauce topped with roasted cashews.",
    price: 260,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-redhot-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Redhot Chicken",
    description: "Extremely spicy chicken cubes glazed with crushed red pepper reduction and hot garlic paste.",
    price: 260,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-pepper-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Pepper Chicken",
    description: "Succulent chicken morsels heavily seasoned with freshly ground black pepper and curry leaves.",
    price: 260,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-loose-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Loose Chicken",
    description: "Crispy shredded chicken bites stir-fried with shredded ginger, garlic, and hot red chillies.",
    price: 260,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chk-555",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chicken 555",
    description: "Signature crispy chicken fingers tossed with zesty chilli paste, cashew bits, and curd glaze.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-kaju-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Kaju Chicken",
    description: "Tender chicken cooked with a generous mountain of roasted whole cashew nuts in royal masala.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-drums-heaven",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Drums of Heaven (6 Pieces)",
    description: "6 juicy chicken drumettes frenched, deep-fried, and tossed in luscious spicy Schezwan glaze.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1527477378399-52e6945a0b77?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chk-lollipop-6",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chicken Lollipop (6 Pieces)",
    description: "6 classic crispy fried chicken wings shaped into lollipops, served with homemade Schezwan dip.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1527477378399-52e6945a0b77?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chk-wings-6",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chicken Wings (6 Pieces)",
    description: "6 golden spiced crispy chicken wings seasoned with house spice rub.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1527477378399-52e6945a0b77?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvs-chk-lollipop-3",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Starters",
    name: "Chicken Lollipop (3 Pieces)",
    description: "3 crunchy chicken lollipops paired with hot garlic dipping sauce.",
    price: 180,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1527477378399-52e6945a0b77?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 4. VEG BIRYANIS
  // ==========================================
  {
    id: "vc-vb-veg-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Biryanis",
    name: "Veg Biryani",
    description: "Fragrant basmati rice layered with garden vegetables, mint, caramelized onions, and whole spices.",
    price: 170,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vb-kaju-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Biryanis",
    name: "Kaju Biryani",
    description: "Rich biryani loaded with premium roasted whole cashew nuts in fragrant saffron rice.",
    price: 240,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vb-paneer-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Biryanis",
    name: "Paneer Biryani",
    description: "Soft marinated paneer chunks layered with aromatic long-grain basmati biryani.",
    price: 220,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vb-egg-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Biryanis",
    name: "Egg Biryani",
    description: "Spiced boiled eggs cooked in flavorful dum gravy, layered with ghee-seasoned biryani rice.",
    price: 170,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 5. NON-VEG BIRYANIS
  // ==========================================
  {
    id: "vc-nvb-chk-dum-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken Dum Biryani",
    description: "Traditional slow dum-cooked Hyderabadi chicken biryani with tender meat, saffron & basmati rice.",
    price: 190,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvb-chk-curry-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken Curry Biryani",
    description: "Savory chicken curry layered with rich spiced basmati biryani for extra sauce lovers.",
    price: 210,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvb-chk-fry-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken Fry Biryani",
    description: "Andhra special spicy roast chicken fry pieces served on top of aromatic dum biryani rice.",
    price: 210,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvb-chk-65-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken 65 Biryani",
    description: "Crispy spicy Chicken 65 pieces tossed with curry leaf glaze over fragrant dum biryani.",
    price: 270,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvb-chk-boneless-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken Boneless Biryani",
    description: "Juicy, boneless chicken cubes marinated in special tandoori masala atop fluffy biryani rice.",
    price: 280,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvb-chk-moglai-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken Moglai Biryani",
    description: "Decadent Mughlai style biryani infused with beaten egg, nuts, cream and fragrant herbs.",
    price: 280,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvb-chk-lollipop-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken Lollipop Biryani (4-PC)",
    description: "4 succulent fried chicken lollipops served on a generous portion of aromatic biryani rice.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1527477378399-52e6945a0b77?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvb-chk-wings-biryani",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Biryanis",
    name: "Chicken Wings Biryani (4-PC)",
    description: "4 flavorful seasoned chicken wings nestled inside steaming hot basmati biryani.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1527477378399-52e6945a0b77?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 6. NOODLES
  // ==========================================
  {
    id: "vc-nd-veg-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Veg Noodles",
    description: "Wok-tossed Hakka noodles with shredded cabbage, carrots, capsicum, and oriental sauces.",
    price: 100,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-veg-manchurian-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Veg Manchurian Noodles",
    description: "Stir-fried noodles combined with crispy vegetable Manchurian balls in rich savory glaze.",
    price: 130,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-sp-veg-noodles-kaju",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Sp Veg Noodles (Kaju)",
    description: "Special vegetable noodles packed with crunchy roasted cashew nuts and fresh vegetables.",
    price: 150,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-egg-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Egg Noodles",
    description: "Egg-scrambled Hakka noodles tossed on high heat with crisp vegetables and soya sauce.",
    price: 130,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-double-egg-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Double Egg Noodles",
    description: "Loaded with double the fluffy scrambled egg, stir-fried with noodles and spring onions.",
    price: 140,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-sp-egg-noodles-kaju",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Sp Egg Noodles (Kaju)",
    description: "Special egg noodles loaded with roasted whole cashews and seasoned with chef's spices.",
    price: 160,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-egg-manchurian-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Egg Manchurian Noodles",
    description: "Savory egg noodles tossed together with crispy seasoned egg Manchurian pieces.",
    price: 140,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-sp-egg-manchurian-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Sp Egg Manchurian Noodles",
    description: "Deluxe egg noodles loaded with extra egg manchurian bites and zesty sauces.",
    price: 160,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-chk-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Chicken Noodles",
    description: "Street-style wok-fried noodles with tender chicken strips, egg, and crunchy julienned veggies.",
    price: 150,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-double-egg-chk-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Double Egg Chicken Noodles",
    description: "Hearty combo of double scrambled eggs and tender chicken bites stir-fried with noodles.",
    price: 160,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-chk-manchurian-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Chicken Manchurian Noodles",
    description: "Savory noodles tossed with crunchy chicken Manchurian balls and spring onions.",
    price: 170,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nd-paneer-noodles",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Noodles",
    name: "Paneer Noodles",
    description: "Soft paneer cubes wok-tossed with flavorful noodles, bell peppers and dark soy sauce.",
    price: 160,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 7. FRIED RICE
  // ==========================================
  {
    id: "vc-fr-veg-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Veg Fried Rice",
    description: "Wok-tossed basmati rice with finely diced carrots, beans, cabbage, and light seasoning.",
    price: 110,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-veg-manchuria-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Veg Manchuria Fried Rice",
    description: "Classic vegetable fried rice tossed with crispy veg Manchurian dumplings.",
    price: 130,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-sp-veg-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Sp Veg Fried Rice",
    description: "Special vegetable fried rice with roasted cashew nuts and extra aromatic seasoning.",
    price: 160,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-veg-schezwan-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Veg Schezwan Fried Rice",
    description: "Spicy Schezwan sauce tossed fried rice with crunchy vegetables and fiery red chillies.",
    price: 140,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-sp-schezwan-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Sp Schezwan Fried Rice",
    description: "Extra spicy Schezwan fried rice with roasted cashew nuts and bell peppers.",
    price: 180,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-egg-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Egg Fried Rice",
    description: "Fluffy basmati rice wok-fried with scrambled eggs, diced vegetables and black pepper.",
    price: 150,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-sp-egg-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Sp Egg Fried Rice",
    description: "Chef's special egg fried rice with crunchy roasted cashews and aromatic herbs.",
    price: 160,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-egg-manchuria-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Egg Manchuria Rice",
    description: "Savory fried rice blended with delicious egg Manchurian pieces.",
    price: 140,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-sp-egg-manchuria-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Sp Egg Manchuria Rice",
    description: "Deluxe portion of egg Manchurian fried rice with rich scallion seasoning.",
    price: 170,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-chk-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Chicken Fried Rice",
    description: "Wok-charred fragrant basmati rice tossed with spiced chicken cubes, egg, and fresh veggies.",
    price: 150,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-chk-manchuria-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Chicken Manchuria Fried Rice",
    description: "Chicken fried rice loaded with crispy chicken Manchurian bites in garlic soy reduction.",
    price: 180,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-sp-chk-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Sp Chicken Fried Rice",
    description: "Special chicken fried rice with whole roasted cashews, egg, and signature seasoning.",
    price: 180,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-sp-chk-manchuria-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Sp Chicken Manchuria Rice",
    description: "Grand portion of fried rice with chicken Manchurian balls, egg, and cashew nut garnish.",
    price: 200,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-paneer-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Paneer Fried Rice",
    description: "Golden paneer cubes tossed with steamed basmati rice, vegetables and light spices.",
    price: 140,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-schezwan-chk-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Schezwan Chicken Fried Rice",
    description: "Fiery Schezwan chicken fried rice with tender chicken, egg, and hot red chilli oil.",
    price: 160,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-sp-schezwan-chk-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Sp Schezwan Chicken Fried Rice",
    description: "Extra spicy Schezwan chicken rice with roasted whole cashews and crisp bell peppers.",
    price: 200,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-fr-schezwan-paneer-fried-rice",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Fried Rice",
    name: "Schezwan Paneer Fried Rice",
    description: "Soft paneer cubes tossed in zesty spicy Schezwan sauce with aromatic basmati rice.",
    price: 160,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 8. VEG CURRIES
  // ==========================================
  {
    id: "vc-vc-paneer-butter-masala",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Curries",
    name: "Paneer Butter Masala",
    description: "Soft paneer cubes simmered in a luscious, velvety tomato-butter gravy with aromatic kasuri methi.",
    price: 210,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vc-methi-chaman",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Curries",
    name: "Methi Chaman",
    description: "Kashmiri delicacy of paneer cooked in a rich, fragrant gravy of fresh fenugreek leaves and spices.",
    price: 180,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vc-tomato-curry",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Curries",
    name: "Tomato Curry",
    description: "Homestyle tangy and spiced ripe tomato gravy tempered with mustard, cumin and curry leaves.",
    price: 120,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vc-kaju-tomato",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Curries",
    name: "Kaju Tomato",
    description: "Whole roasted cashew nuts simmered in a creamy, tangy tomato and onion masala.",
    price: 210,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vc-kadai-paneer",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Curries",
    name: "Kadai Paneer",
    description: "Paneer cubes and crunchy bell peppers tossed in a robust gravy of freshly roasted kadai masala.",
    price: 210,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-vc-dal-tadka",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Veg Curries",
    name: "Dal Tadka",
    description: "Yellow lentils cooked to perfection and tempered with sizzling ghee, garlic, cumin & red chillies.",
    price: 140,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 9. NON-VEG CURRIES
  // ==========================================
  {
    id: "vc-nvc-chk-curry-bone",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Curries",
    name: "Chicken Curry (Bone)",
    description: "Homestyle Andhra bone-in chicken curry simmered with spicy onion-ginger-garlic gravy.",
    price: 200,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvc-chk-curry-boneless",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Curries",
    name: "Chicken Curry Boneless",
    description: "Succulent boneless chicken pieces cooked in a rich, aromatic and spicy masala gravy.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvc-butter-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Curries",
    name: "Butter Chicken",
    description: "Grilled chicken pieces bathed in a smooth, rich tomato, butter, and cream reduction.",
    price: 300,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvc-kadai-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Curries",
    name: "Kadai Chicken",
    description: "Chicken and capsicum stir-fried in a spicy tomato gravy with freshly ground coriander and cumin.",
    price: 280,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvc-kolhapuri-chk",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Curries",
    name: "Kolhapuri Chicken",
    description: "Extremely spicy and rich chicken curry with coconut, sesame seeds and Kolhapuri red chillies.",
    price: 280,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-nvc-kaju-chk-curry",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Non-Veg Curries",
    name: "Kaju Chicken Curry",
    description: "Royal chicken curry enriched with roasted cashews and velvety nut gravy.",
    price: 320,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80"
  },

  // ==========================================
  // 10. BREADS & FRANKIES
  // ==========================================
  {
    id: "vc-bf-chapati-single",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Chapati (Single)",
    description: "Soft, freshly rolled whole wheat flatbread roasted on hot griddle.",
    price: 25,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-chapati-full",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Chapati Full",
    description: "Set of warm, soft whole wheat chapatis perfect with any veg or non-veg curry.",
    price: 50,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-parotta-single",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Parotta (Single)",
    description: "Flaky, layered South Indian Malabar parotta cooked golden with ghee.",
    price: 60,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-parotta-full",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Parotta Full",
    description: "Pair of flaky layered parottas with crispy outer crust and soft interior.",
    price: 90,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-roti",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Roti",
    description: "Tandoori style crisp and soft wheat bread.",
    price: 20,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-paneer-frankie",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Paneer Frankie",
    description: "Warm roll stuffed with spicy masala paneer, sliced onions, chaat masala, and tangy sauces.",
    price: 100,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-egg-roll",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Egg Roll",
    description: "Crisp parotta wrapped around an egg layer with crunchy onion relish and spicy chutneys.",
    price: 85,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-chk-frankie",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Chicken Frankie",
    description: "Delicious roll loaded with spiced juicy chicken chunks, pickled onions, and special mint sauce.",
    price: 100,
    is_veg: false,
    image_url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "vc-bf-veg-frankie",
    restaurant_id: "vilasa-cafe",
    restaurant_name: "Vilasa Café",
    category: "Breads & Frankies",
    name: "Veg Frankie",
    description: "Classic veggie roll stuffed with spiced potato-veggie filling, onions and tangy sauces.",
    price: 70,
    is_veg: true,
    image_url: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=600&q=80"
  }
];

async function main() {
  console.log('====================================================');
  console.log('🍽️  ADDING VILASA CAFÉ & 88 MENU ITEMS TO NEON DB');
  console.log('====================================================');

  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined in .env!');
    process.exit(1);
  }

  const sql = neon(dbUrl);

  try {
    // 1. Upsert Vilasa Cafe Restaurant into Neon DB
    console.log(`\n🏪 1. Upserting ${VILASA_RESTAURANT.name}...`);
    await sql`
      INSERT INTO restaurants (id, name, description, is_open, phone, location, cuisine, image_url, updated_at)
      VALUES (
        ${VILASA_RESTAURANT.id},
        ${VILASA_RESTAURANT.name},
        ${VILASA_RESTAURANT.description},
        true,
        ${VILASA_RESTAURANT.phone},
        ${VILASA_RESTAURANT.location},
        ${VILASA_RESTAURANT.cuisine},
        ${VILASA_RESTAURANT.image_url},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        name = ${VILASA_RESTAURANT.name},
        description = ${VILASA_RESTAURANT.description},
        is_open = true,
        phone = ${VILASA_RESTAURANT.phone},
        location = ${VILASA_RESTAURANT.location},
        cuisine = ${VILASA_RESTAURANT.cuisine},
        image_url = ${VILASA_RESTAURANT.image_url},
        updated_at = NOW();
    `;
    console.log('✅ Vilasa Café successfully saved in Neon restaurants table!');

    // 2. Add Vilasa Cafe Admin Account
    console.log('\n👤 2. Upserting Vilasa Café admin account...');
    await sql`
      INSERT INTO admin_accounts (id, username, name, role, restaurant_id, password_hash)
      VALUES (
        'admin-vilasa',
        'vilasa_admin',
        'Vilasa Café Admin',
        'restaurant_admin',
        'vilasa-cafe',
        'Vilasa@Campus2026'
      )
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        restaurant_id = EXCLUDED.restaurant_id,
        password_hash = EXCLUDED.password_hash;
    `;
    console.log('✅ Vilasa Café admin account synced (username: vilasa_admin)');

    // 3. Clear existing items for Vilasa Cafe and seed all 88 items
    console.log(`\n🍛 3. Seeding ${VILASA_MENU_ITEMS.length} menu items for Vilasa Café...`);
    await sql`DELETE FROM menu_items WHERE restaurant_id = 'vilasa-cafe';`;

    let count = 0;
    for (const item of VILASA_MENU_ITEMS) {
      await sql`
        INSERT INTO menu_items (
          id, restaurant_id, restaurant_name, category, name, description, price, is_veg, is_available, image_url, preparation_time, rating, created_at, updated_at
        ) VALUES (
          ${item.id},
          ${item.restaurant_id},
          ${item.restaurant_name},
          ${item.category},
          ${item.name},
          ${item.description},
          ${item.price},
          ${item.is_veg},
          true,
          ${item.image_url},
          '15-20 mins',
          4.8,
          NOW(),
          NOW()
        );
      `;
      count++;
    }
    console.log(`✅ Successfully seeded ${count} dishes into Neon DB for Vilasa Café!`);

    // 4. Verify in Neon DB
    const resCount = await sql`SELECT count(*) as total FROM menu_items WHERE restaurant_id = 'vilasa-cafe';`;
    console.log(`\n🔍 Neon Verification: Found ${resCount[0]?.total} menu items for Vilasa Café in database.`);

  } catch (err) {
    console.error('❌ Error seeding Vilasa Café to Neon DB:', err);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
