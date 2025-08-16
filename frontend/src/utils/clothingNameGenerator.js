// Utility to generate proper Indian clothing names
export const generateClothingNames = () => {
  const womenTraditional = [
    "Elegant Silk Saree", "Designer Lehenga", "Cotton Kurti", "Anarkali Dress",
    "Salwar Kameez Set", "Churidar Suit", "Patiala Suit", "Dupatta Scarf",
    "Langa Voni", "Mekhela Chador", "Sharara Set", "Gharara Outfit",
    "Saree Blouse", "Half Saree", "Bandhani Saree", "Banarasi Saree",
    "Kanchipuram Saree", "Kota Doria Saree", "Uppada Saree", "Phulkari Suit",
    "Bagh Print Kurta", "Silk Lehenga", "Kalamkari Saree", "Paithani Saree",
    "Sambalpuri Saree", "Pochampally Saree", "Jamdani Saree", "Bhagalpuri Saree",
    "Tussar Silk Saree", "Chikankari Kurta", "Khadi Kurta", "Organza Saree"
  ];

  const menTraditional = [
    "Cotton Dhoti", "Silk Kurta", "Linen Pajama", "Wedding Sherwani",
    "Formal Achkan", "Nehru Jacket", "Bandhgala Suit", "Pathani Suit",
    "Jodhpuri Suit", "Traditional Angrakha", "South Indian Veshti", "Casual Lungi",
    "Kerala Mundu", "Kashmiri Choga", "Coorgi Kupya", "Himachali Chola",
    "Gujarati Kedia", "Dogri Kurta", "Bihu Costume", "Khasi Jymphong",
    "Manipuri Shirt", "Kullu Wool Coat", "Silk Angavastram", "Garhwali Overcoat",
    "Traditional Safa", "Decorative Pagri", "Wedding Sehra", "Tikka Jacket",
    "Dabu Print Kurta", "Phulkari Kurta", "Bandhani Kurta", "Ikat Vest"
  ];

  const innerwear = [
    "Cotton Bra", "Lace Jatti", "Boxer Shorts", "Cotton Vest",
    "Thermal Wear", "Silk Camisole", "Cotton Petticoat", "Padded Corset",
    "Sports Bra", "Shape Wear", "Men's Briefs", "Cotton Trunks",
    "Lace Thong", "Boy Shorts", "Silk Chemise", "Cotton Slip",
    "Nursing Bra", "Maternity Wear", "Seamless Panties", "Push-up Bra",
    "Strapless Bra", "Tube Bra", "High-waist Panties", "Thermal Leggings",
    "Woolen Undershirt", "V-neck Vest", "Round Neck Vest", "Cotton Slips",
    "Modal Panties", "Lace Lingerie", "Inner Skirt", "Stretch Vest"
  ];

  const womenModern = [
    "Blue Jeans", "Casual T-shirt", "Crop Top", "Palazzo Pants",
    "Pencil Skirt", "Maxi Dress", "Midi Dress", "Denim Jacket",
    "Cotton Shrug", "Bomber Jacket", "Hooded Dress", "Track Pants",
    "Tracksuit", "Sleeveless Top", "Bell-bottom Jeans", "Jumpsuit",
    "Summer Romper", "Wrap Dress", "Bodycon Dress", "Tank Top",
    "Off-shoulder Top", "Tube Top", "Peplum Blouse", "Shirt Dress",
    "Athletic Joggers", "Cargo Pants", "Leather Skirt", "Short Kurti",
    "A-line Dress", "Collared Shirt", "Henley Tee", "Kaftan Dress"
  ];

  const menModern = [
    "Blue Jeans", "Cotton T-shirt", "Formal Shirt", "Casual Hoodie",
    "Bomber Jacket", "Denim Jacket", "Cargo Pants", "Cotton Shorts",
    "Crew Sweatshirt", "Track Suit", "Polo Shirt", "Henley Tee",
    "Business Suit", "Chino Pants", "Running Joggers", "Wool Blazer",
    "Knit Cardigan", "Tank Top", "Leather Jacket", "Winter Overcoat",
    "Trench Coat", "Graphic Tee", "Turtle Neck", "Checked Shirt",
    "Mandarin Shirt", "Ripped Jeans", "Skinny Jeans", "Dress Trousers",
    "V-neck Tee", "Printed Shirt", "Utility Pants", "Athletic Shorts"
  ];

  return {
    womenTraditional,
    menTraditional,
    innerwear,
    womenModern,
    menModern
  };
};

// Function to get proper product name based on category
export const getProperProductName = (originalName, category, type, gender) => {
  const names = generateClothingNames();
  
  // Map to appropriate category
  if (category === 'clothes') {
    if (type === 'traditional') {
      if (gender === 'women') {
        return names.womenTraditional[Math.floor(Math.random() * names.womenTraditional.length)];
      } else {
        return names.menTraditional[Math.floor(Math.random() * names.menTraditional.length)];
      }
    } else if (type === 'innerwear') {
      return names.innerwear[Math.floor(Math.random() * names.innerwear.length)];
    } else {
      if (gender === 'women') {
        return names.womenModern[Math.floor(Math.random() * names.womenModern.length)];
      } else {
        return names.menModern[Math.floor(Math.random() * names.menModern.length)];
      }
    }
  }
  
  return originalName; // fallback
};

export default {
  generateClothingNames,
  getProperProductName
};
