const fs = require('fs');

// Create the exact 1000 clothing items as specified by the user
const createExact1000Catalog = () => {
    const clothingCatalog = [];
    let id = 1;

    // Category 1: Traditional Women's Wear (100 items)
    const traditionalWomensWear = [
        "Saree", "Lehenga", "Salwar Kameez", "Anarkali Suit", "Sharara", "Palazzo Suit", "Churidar Suit",
        "Ghagra Choli", "Kurti", "Dupatta", "Odhni", "Bandhani Saree", "Kanjeevaram Saree", "Banarasi Saree",
        "Chanderi Saree", "Georgette Saree", "Chiffon Saree", "Cotton Saree", "Silk Saree", "Patola Saree",
        "Ikat Saree", "Tant Saree", "Handloom Saree", "Designer Saree", "Party Wear Saree", "Wedding Saree",
        "Casual Saree", "Office Saree", "Printed Saree", "Embroidered Saree", "Zari Work Saree", "Mirror Work Saree",
        "Sequin Saree", "Net Saree", "Organza Saree", "Crepe Saree", "Satin Saree", "Velvet Saree",
        "Linen Saree", "Khadi Saree", "Block Print Saree", "Tie Dye Saree", "Ombre Saree", "Border Saree",
        "Half Saree", "Readymade Saree", "Pre-pleated Saree", "Dhoti Saree", "Mermaid Saree", "Ruffle Saree",
        "Traditional Blouse", "Designer Blouse", "Crop Blouse", "High Neck Blouse", "Backless Blouse", "Halter Blouse",
        "Cold Shoulder Blouse", "Puff Sleeve Blouse", "Cape Blouse", "Jacket Blouse", "Corset Blouse", "Bustier Blouse",
        "Choli", "Bandeau Choli", "Tube Choli", "Bralette Choli", "Off Shoulder Choli", "One Shoulder Choli",
        "Asymmetric Choli", "Crop Choli", "Long Choli", "Short Choli", "Embroidered Choli", "Mirror Work Choli",
        "Sequin Choli", "Beaded Choli", "Zardozi Choli", "Gota Work Choli", "Thread Work Choli", "Pearl Work Choli",
        "Stone Work Choli", "Velvet Choli", "Silk Choli", "Net Choli", "Georgette Choli", "Chiffon Choli",
        "Satin Choli", "Brocade Choli", "Jacquard Choli", "Lace Choli", "Mesh Choli", "Tulle Choli",
        "Organza Choli", "Crepe Choli", "Cotton Choli", "Linen Choli", "Khadi Choli", "Handwoven Choli",
        "Digital Print Choli", "Floral Print Choli", "Geometric Print Choli", "Abstract Print Choli"
    ];

    // Category 2: Traditional Men's Wear (100 items)
    const traditionalMensWear = [
        "Kurta", "Dhoti", "Lungi", "Mundu", "Veshti", "Pyjama", "Churidar", "Pathani Suit", "Sherwani",
        "Bandhgala", "Nehru Jacket", "Modi Jacket", "Jodhpuri Suit", "Indo Western", "Achkan", "Angrakha",
        "Sadri", "Waistcoat", "Ethnic Jacket", "Traditional Shirt", "Silk Kurta", "Cotton Kurta", "Linen Kurta",
        "Khadi Kurta", "Handloom Kurta", "Printed Kurta", "Embroidered Kurta", "Designer Kurta", "Party Wear Kurta",
        "Wedding Kurta", "Casual Kurta", "Formal Kurta", "Short Kurta", "Long Kurta", "Straight Kurta",
        "A-Line Kurta", "Asymmetric Kurta", "Chinese Collar Kurta", "Band Collar Kurta", "Mandarin Collar Kurta",
        "Round Neck Kurta", "V Neck Kurta", "Henley Kurta", "Button Down Kurta", "Zip Kurta", "Pullover Kurta",
        "Hoodie Kurta", "Jacket Kurta", "Layered Kurta", "Draped Kurta", "Wrap Kurta", "Tunic Kurta",
        "Kaftan Kurta", "Pathani Kurta", "Lucknowi Kurta", "Chikankari Kurta", "Zardozi Kurta", "Mirror Work Kurta",
        "Thread Work Kurta", "Block Print Kurta", "Tie Dye Kurta", "Batik Kurta", "Ikat Kurta", "Kalamkari Kurta",
        "Bandhani Kurta", "Ajrakh Kurta", "Sanganeri Kurta", "Bagru Kurta", "Dabu Kurta", "Warli Kurta",
        "Madhubani Kurta", "Phulkari Kurta", "Kantha Kurta", "Applique Kurta", "Patchwork Kurta", "Cutwork Kurta",
        "Laser Cut Kurta", "Digital Print Kurta", "3D Print Kurta", "Foil Print Kurta", "Metallic Print Kurta",
        "Gradient Kurta", "Ombre Kurta", "Color Block Kurta", "Stripe Kurta", "Check Kurta", "Plaid Kurta",
        "Polka Dot Kurta", "Floral Kurta", "Paisley Kurta", "Geometric Kurta", "Abstract Kurta", "Tribal Kurta",
        "Vintage Kurta", "Retro Kurta", "Contemporary Kurta", "Modern Kurta", "Fusion Kurta", "Western Kurta"
    ];

    // Category 3: Innerwear (100 items)
    const innerwear = [
        "Bra", "Panty", "Camisole", "Slip", "Petticoat", "Shapewear", "Corset", "Bustier", "Bodysuit",
        "Lingerie Set", "Push Up Bra", "Strapless Bra", "Sports Bra", "Nursing Bra", "T-Shirt Bra",
        "Balconette Bra", "Plunge Bra", "Minimizer Bra", "Maximizer Bra", "Wireless Bra", "Seamless Bra",
        "Lace Bra", "Cotton Bra", "Satin Bra", "Silk Bra", "Microfiber Bra", "Modal Bra", "Bamboo Bra",
        "Organic Cotton Bra", "Brief", "Bikini Panty", "Thong", "Boyshort", "Hipster", "High Waist Panty",
        "Low Rise Panty", "Mid Rise Panty", "Seamless Panty", "Lace Panty", "Cotton Panty", "Satin Panty",
        "Silk Panty", "Microfiber Panty", "Modal Panty", "Bamboo Panty", "Thermal Innerwear", "Long Johns",
        "Thermal Top", "Thermal Bottom", "Base Layer", "Compression Wear", "Shapewear Brief", "Shapewear Short",
        "Body Shaper", "Waist Trainer", "Tummy Control", "Hip Enhancer", "Padded Bra", "Gel Bra",
        "Silicone Bra", "Adhesive Bra", "Backless Bra", "Convertible Bra", "Multiway Bra", "Bandeau Bra",
        "Tube Bra", "Bralette", "Crop Top Bra", "Longline Bra", "Full Coverage Bra", "Demi Bra",
        "Quarter Cup Bra", "Open Cup Bra", "Sheer Bra", "Mesh Bra", "Fishnet Bra", "Strappy Bra",
        "Caged Bra", "Harness Bra", "Vintage Bra", "Retro Bra", "Pin Up Bra", "Bridal Lingerie",
        "Honeymoon Lingerie", "Valentine Lingerie", "Christmas Lingerie", "Role Play Lingerie", "Fantasy Lingerie",
        "Exotic Lingerie", "Plus Size Lingerie", "Maternity Lingerie", "Teen Lingerie", "Senior Lingerie",
        "Everyday Lingerie", "Comfort Lingerie", "Luxury Lingerie", "Designer Lingerie", "Budget Lingerie",
        "Eco Friendly Lingerie", "Sustainable Lingerie", "Vegan Lingerie", "Hypoallergenic Lingerie"
    ];

    // Category 4: Modern Wear (100 items)
    const modernWear = [
        "T-Shirt", "Tank Top", "Crop Top", "Tube Top", "Halter Top", "Off Shoulder Top", "Cold Shoulder Top",
        "One Shoulder Top", "Asymmetric Top", "Peplum Top", "Wrap Top", "Tie Front Top", "Knot Top",
        "Ruched Top", "Pleated Top", "Ruffled Top", "Flounce Top", "Tiered Top", "Layered Top", "Mesh Top",
        "Sheer Top", "Lace Top", "Crochet Top", "Embroidered Top", "Beaded Top", "Sequin Top", "Metallic Top",
        "Velvet Top", "Satin Top", "Silk Top", "Chiffon Top", "Georgette Top", "Crepe Top", "Jersey Top",
        "Cotton Top", "Linen Top", "Modal Top", "Bamboo Top", "Organic Cotton Top", "Printed Top",
        "Graphic Tee", "Slogan Tee", "Band Tee", "Vintage Tee", "Oversized Tee", "Fitted Tee", "Relaxed Tee",
        "Long Sleeve Top", "Short Sleeve Top", "Sleeveless Top", "Cap Sleeve Top", "Bell Sleeve Top",
        "Flare Sleeve Top", "Puff Sleeve Top", "Bishop Sleeve Top", "Dolman Sleeve Top", "Raglan Sleeve Top",
        "Shirt", "Blouse", "Button Down Shirt", "Button Up Shirt", "Henley Shirt", "Polo Shirt", "Tunic Shirt",
        "Boyfriend Shirt", "Oversized Shirt", "Fitted Shirt", "Slim Fit Shirt", "Regular Fit Shirt", "Loose Fit Shirt",
        "Cropped Shirt", "Long Shirt", "High Low Shirt", "Asymmetric Shirt", "Wrap Shirt", "Tie Front Shirt",
        "Knotted Shirt", "Pintuck Shirt", "Pleated Shirt", "Ruffled Shirt", "Embellished Shirt", "Lace Shirt",
        "Mesh Shirt", "Sheer Shirt", "Printed Shirt", "Striped Shirt", "Checkered Shirt", "Plaid Shirt",
        "Polka Dot Shirt", "Floral Shirt", "Geometric Shirt", "Abstract Shirt", "Solid Color Shirt", "Ombre Shirt",
        "Tie Dye Shirt", "Gradient Shirt", "Color Block Shirt", "Denim Shirt", "Chambray Shirt", "Flannel Shirt",
        "Corduroy Shirt", "Velvet Shirt", "Silk Shirt", "Satin Shirt", "Chiffon Shirt", "Georgette Shirt"
    ];

    // Category 5: Unisex (100 items)
    const unisex = [
        "Hoodie", "Sweatshirt", "Pullover", "Cardigan", "Sweater", "Jumper", "Vest", "Gilet", "Jacket",
        "Blazer", "Coat", "Parka", "Windbreaker", "Rain Jacket", "Denim Jacket", "Leather Jacket",
        "Bomber Jacket", "Track Jacket", "Zip Hoodie", "Pullover Hoodie", "Graphic Hoodie", "Plain Hoodie",
        "Oversized Hoodie", "Fitted Hoodie", "Cropped Hoodie", "Long Hoodie", "Sleeveless Hoodie", "Fleece Hoodie",
        "Cotton Hoodie", "Polyester Hoodie", "French Terry Hoodie", "Sherpa Hoodie", "Vintage Hoodie",
        "Retro Hoodie", "Band Hoodie", "Sports Hoodie", "University Hoodie", "Logo Hoodie", "Minimalist Hoodie",
        "Colorblock Hoodie", "Striped Hoodie", "Printed Hoodie", "Embroidered Hoodie", "Applique Hoodie",
        "Patched Hoodie", "Distressed Hoodie", "Faded Hoodie", "Washed Hoodie", "Raw Hoodie", "Organic Hoodie",
        "Sustainable Hoodie", "Eco Friendly Hoodie", "Recycled Hoodie", "Vegan Hoodie", "Crewneck Sweatshirt",
        "V Neck Sweatshirt", "Round Neck Sweatshirt", "Mock Neck Sweatshirt", "Quarter Zip Sweatshirt",
        "Half Zip Sweatshirt", "Full Zip Sweatshirt", "Raglan Sweatshirt", "Drop Shoulder Sweatshirt",
        "Oversized Sweatshirt", "Fitted Sweatshirt", "Cropped Sweatshirt", "Long Sweatshirt", "Vintage Sweatshirt",
        "Retro Sweatshirt", "University Sweatshirt", "Sports Sweatshirt", "Team Sweatshirt", "Logo Sweatshirt",
        "Graphic Sweatshirt", "Text Sweatshirt", "Minimalist Sweatshirt", "Plain Sweatshirt", "Solid Sweatshirt",
        "Heather Sweatshirt", "Melange Sweatshirt", "Two Tone Sweatshirt", "Colorblock Sweatshirt", "Striped Sweatshirt",
        "Printed Sweatshirt", "Embroidered Sweatshirt", "Applique Sweatshirt", "Sequin Sweatshirt", "Beaded Sweatshirt",
        "Rhinestone Sweatshirt", "Stud Sweatshirt", "Chain Sweatshirt", "Fringe Sweatshirt", "Tassel Sweatshirt",
        "Pompom Sweatshirt", "Fur Trim Sweatshirt", "Faux Fur Sweatshirt", "Sherpa Sweatshirt", "Fleece Sweatshirt"
    ];

    // Category 6: Festival Wear (100 items)
    const festivalWear = [
        "Diwali Dress", "Holi Outfit", "Navratri Chaniya Choli", "Ganesh Chaturthi Dress", "Karwa Chauth Saree",
        "Raksha Bandhan Kurta", "Janmashtami Outfit", "Dussehra Dress", "Eid Dress", "Christmas Outfit",
        "New Year Dress", "Valentine Dress", "Wedding Guest Outfit", "Sangeet Dress", "Mehendi Outfit",
        "Haldi Ceremony Dress", "Engagement Dress", "Reception Gown", "Cocktail Dress", "Party Wear",
        "Festive Saree", "Designer Lehenga", "Embellished Gown", "Sequin Dress", "Metallic Dress",
        "Shimmer Dress", "Glitter Dress", "Beaded Dress", "Crystal Dress", "Rhinestone Dress",
        "Pearl Dress", "Gold Dress", "Silver Dress", "Bronze Dress", "Copper Dress", "Rose Gold Dress",
        "Black Tie Dress", "White Party Dress", "Red Carpet Dress", "Gala Dress", "Ball Gown",
        "Princess Dress", "Fairy Tale Dress", "Vintage Party Dress", "Retro Party Dress", "Art Deco Dress",
        "Bohemian Festival Dress", "Hippie Dress", "Gypsy Dress", "Ethnic Fusion Dress", "Indo Western Gown",
        "Dhoti Gown", "Saree Gown", "Lehenga Gown", "Sharara Gown", "Palazzo Gown", "Anarkali Gown",
        "Floor Length Dress", "Midi Festival Dress", "Mini Festival Dress", "Asymmetric Festival Dress",
        "High Low Festival Dress", "Mermaid Festival Dress", "A Line Festival Dress", "Fit Flare Festival Dress",
        "Bodycon Festival Dress", "Shift Festival Dress", "Wrap Festival Dress", "Halter Festival Dress",
        "Strapless Festival Dress", "Off Shoulder Festival Dress", "One Shoulder Festival Dress", "Backless Festival Dress",
        "Cut Out Festival Dress", "Sheer Festival Dress", "Lace Festival Dress", "Mesh Festival Dress",
        "Tulle Festival Dress", "Organza Festival Dress", "Chiffon Festival Dress", "Georgette Festival Dress",
        "Silk Festival Dress", "Satin Festival Dress", "Velvet Festival Dress", "Brocade Festival Dress",
        "Jacquard Festival Dress", "Embroidered Festival Dress", "Hand Work Festival Dress", "Machine Work Festival Dress",
        "Digital Print Festival Dress", "Block Print Festival Dress", "Screen Print Festival Dress", "3D Print Festival Dress"
    ];

    // Category 7: Seasonal Wear (100 items)
    const seasonalWear = [
        "Summer Dress", "Beach Dress", "Sundress", "Maxi Dress", "Mini Dress", "Shift Dress", "A Line Dress",
        "Wrap Dress", "Halter Dress", "Strapless Dress", "Spaghetti Strap Dress", "Tank Dress", "Sleeveless Dress",
        "Short Sleeve Dress", "Cap Sleeve Dress", "Cold Shoulder Dress", "Off Shoulder Dress", "Backless Dress",
        "Cut Out Dress", "Bodycon Dress", "Fit Flare Dress", "Skater Dress", "Swing Dress", "Tent Dress",
        "Tunic Dress", "Shirt Dress", "T Shirt Dress", "Polo Dress", "Henley Dress", "Button Down Dress",
        "Zip Front Dress", "Tie Front Dress", "Wrap Front Dress", "Asymmetric Dress", "High Low Dress",
        "Tiered Dress", "Ruffled Dress", "Pleated Dress", "Gathered Dress", "Smocked Dress", "Elastic Waist Dress",
        "Belt Dress", "Sash Dress", "Drawstring Dress", "Lace Up Dress", "Corset Dress", "Bustier Dress",
        "Empire Waist Dress", "Drop Waist Dress", "Natural Waist Dress", "High Waist Dress", "Low Waist Dress",
        "Winter Coat", "Wool Coat", "Cashmere Coat", "Down Coat", "Puffer Coat", "Trench Coat", "Peacoat",
        "Overcoat", "Long Coat", "Short Coat", "Mid Length Coat", "Belted Coat", "Wrap Coat", "Double Breasted Coat",
        "Single Breasted Coat", "Button Up Coat", "Zip Up Coat", "Toggle Coat", "Duffle Coat", "Parka Coat",
        "Anorak", "Rain Coat", "Windbreaker Coat", "Ski Jacket", "Snow Jacket", "Thermal Jacket", "Fleece Jacket",
        "Wool Jacket", "Cashmere Jacket", "Down Jacket", "Puffer Jacket", "Quilted Jacket", "Padded Jacket",
        "Insulated Jacket", "Heated Jacket", "Tech Jacket", "Performance Jacket", "Outdoor Jacket", "Hiking Jacket",
        "Camping Jacket", "Travel Jacket", "Commuter Jacket", "Urban Jacket", "Street Jacket", "Fashion Jacket",
        "Casual Jacket", "Formal Jacket", "Business Jacket", "Office Jacket", "Work Jacket", "Professional Jacket",
        "Corporate Jacket", "Executive Jacket", "Meeting Jacket", "Conference Jacket", "Presentation Jacket"
    ];

    // Category 8: Fabric Types (100 items)
    const fabricTypes = [
        "Cotton Shirt", "Silk Blouse", "Linen Pants", "Wool Sweater", "Cashmere Cardigan", "Polyester Dress",
        "Rayon Top", "Viscose Skirt", "Modal Underwear", "Bamboo T-Shirt", "Hemp Jacket", "Jute Bag",
        "Denim Jeans", "Corduroy Pants", "Velvet Dress", "Satin Gown", "Chiffon Scarf", "Georgette Saree",
        "Crepe Blouse", "Jersey Dress", "Spandex Leggings", "Lycra Swimsuit", "Nylon Stockings", "Acrylic Sweater",
        "Fleece Hoodie", "Microfiber Towel", "Organza Veil", "Tulle Skirt", "Net Dupatta", "Mesh Top",
        "Lace Lingerie", "Crochet Vest", "Knit Sweater", "Woven Fabric", "Non Woven Fabric", "Felt Hat",
        "Leather Jacket", "Suede Boots", "Patent Leather Shoes", "Faux Leather Bag", "Synthetic Leather Belt",
        "Fur Coat", "Faux Fur Stole", "Sheepskin Rug", "Alpaca Wool Sweater", "Merino Wool Scarf",
        "Angora Sweater", "Mohair Cardigan", "Camel Hair Coat", "Vicuna Shawl", "Pashmina Wrap",
        "Khadi Kurta", "Handloom Saree", "Handspun Cotton", "Organic Cotton T-Shirt", "Recycled Polyester Jacket",
        "Tencel Dress", "Lyocell Blouse", "Cupro Lining", "Acetate Dress", "Triacetate Blouse",
        "Polyamide Leggings", "Elastane Top", "Gore-Tex Jacket", "Waterproof Fabric", "Breathable Fabric",
        "Moisture Wicking Fabric", "UV Protection Fabric", "Antimicrobial Fabric", "Flame Retardant Fabric",
        "Static Free Fabric", "Wrinkle Free Fabric", "Stain Resistant Fabric", "Fade Resistant Fabric",
        "Shrink Resistant Fabric", "Stretch Fabric", "Non Stretch Fabric", "Lightweight Fabric", "Heavyweight Fabric",
        "Medium Weight Fabric", "Sheer Fabric", "Opaque Fabric", "Translucent Fabric", "Transparent Fabric",
        "Matte Fabric", "Glossy Fabric", "Metallic Fabric", "Holographic Fabric", "Iridescent Fabric",
        "Pearlescent Fabric", "Glitter Fabric", "Sequin Fabric", "Beaded Fabric", "Embroidered Fabric",
        "Printed Fabric", "Dyed Fabric", "Bleached Fabric", "Mercerized Fabric", "Brushed Fabric",
        "Napped Fabric", "Calendered Fabric", "Embossed Fabric", "Perforated Fabric", "Quilted Fabric"
    ];

    // Category 9: Fusion Wear (100 items)
    const fusionWear = [
        "Indo Western Dress", "Dhoti Pants", "Palazzo Pants", "Culottes", "Skirt Lehenga", "Crop Top Lehenga",
        "Jacket Lehenga", "Cape Lehenga", "Trail Lehenga", "Pre Draped Saree", "Pant Style Saree", "Gown Style Saree",
        "Belt Saree", "Ruffle Saree", "Layered Saree", "Concept Saree", "Designer Saree", "Fusion Saree",
        "Modern Saree", "Contemporary Saree", "Trendy Saree", "Stylish Saree", "Chic Saree", "Elegant Saree",
        "Sophisticated Saree", "Glamorous Saree", "Luxurious Saree", "Premium Saree", "High End Saree", "Couture Saree",
        "Anarkali Gown", "Floor Length Anarkali", "Long Anarkali", "Short Anarkali", "Asymmetric Anarkali",
        "High Low Anarkali", "A Line Anarkali", "Flare Anarkali", "Straight Anarkali", "Fitted Anarkali",
        "Loose Anarkali", "Flowy Anarkali", "Draped Anarkali", "Layered Anarkali", "Tiered Anarkali",
        "Ruffled Anarkali", "Pleated Anarkali", "Gathered Anarkali", "Smocked Anarkali", "Empire Anarkali",
        "Princess Anarkali", "Ball Gown Anarkali", "Mermaid Anarkali", "Trumpet Anarkali", "Sheath Anarkali",
        "Column Anarkali", "Shift Anarkali", "Wrap Anarkali", "Halter Anarkali", "Strapless Anarkali",
        "Off Shoulder Anarkali", "One Shoulder Anarkali", "Cold Shoulder Anarkali", "Backless Anarkali",
        "Deep Neck Anarkali", "High Neck Anarkali", "Boat Neck Anarkali", "V Neck Anarkali", "Round Neck Anarkali",
        "Square Neck Anarkali", "Scoop Neck Anarkali", "Sweetheart Anarkali", "Cowl Neck Anarkali",
        "Turtle Neck Anarkali", "Mock Neck Anarkali", "Collar Anarkali", "Peter Pan Collar Anarkali",
        "Mandarin Collar Anarkali", "Band Collar Anarkali", "Nehru Collar Anarkali", "Chinese Collar Anarkali",
        "Shawl Collar Anarkali", "Lapel Collar Anarkali", "Peaked Collar Anarkali", "Notched Collar Anarkali",
        "Rolled Collar Anarkali", "Spread Collar Anarkali", "Point Collar Anarkali", "Tab Collar Anarkali",
        "Pin Collar Anarkali", "Club Collar Anarkali", "Wingtip Collar Anarkali", "Stand Up Collar Anarkali",
        "Convertible Collar Anarkali", "Detachable Collar Anarkali", "Hidden Collar Anarkali", "Invisible Collar Anarkali"
    ];

    // Category 10: Accessories & Miscellaneous (100 items)
    const accessories = [
        "Scarf", "Shawl", "Stole", "Dupatta", "Chunni", "Veil", "Headband", "Hair Tie", "Hair Clip",
        "Hair Pin", "Hair Band", "Hair Wrap", "Turban", "Cap", "Hat", "Beanie", "Beret", "Fedora",
        "Sun Hat", "Beach Hat", "Bucket Hat", "Snapback", "Baseball Cap", "Trucker Hat", "Visor",
        "Headscarf", "Bandana", "Necktie", "Bow Tie", "Cravat", "Ascot", "Pocket Square", "Handkerchief",
        "Belt", "Sash", "Cummerbund", "Suspenders", "Braces", "Chain Belt", "Rope Belt", "Fabric Belt",
        "Leather Belt", "Elastic Belt", "Wide Belt", "Thin Belt", "Skinny Belt", "Thick Belt",
        "Waist Belt", "Hip Belt", "High Waist Belt", "Low Waist Belt", "Corset Belt", "Obi Belt",
        "Wrap Belt", "Tie Belt", "Buckle Belt", "D Ring Belt", "O Ring Belt", "Chain Link Belt",
        "Studded Belt", "Embellished Belt", "Jeweled Belt", "Beaded Belt", "Sequin Belt", "Metallic Belt",
        "Gloves", "Mittens", "Arm Warmers", "Wrist Warmers", "Fingerless Gloves", "Long Gloves",
        "Short Gloves", "Driving Gloves", "Work Gloves", "Dress Gloves", "Evening Gloves", "Opera Gloves",
        "Lace Gloves", "Satin Gloves", "Leather Gloves", "Suede Gloves", "Fabric Gloves", "Knit Gloves",
        "Crochet Gloves", "Embroidered Gloves", "Beaded Gloves", "Sequin Gloves", "Metallic Gloves",
        "Tights", "Leggings", "Stockings", "Pantyhose", "Thigh Highs", "Knee Highs", "Ankle Socks",
        "Crew Socks", "No Show Socks", "Footies", "Compression Socks", "Sports Socks", "Dress Socks",
        "Casual Socks", "Wool Socks", "Cotton Socks", "Silk Socks", "Bamboo Socks", "Thermal Socks"
    ];

    // Helper function to create clothing items
    const createClothingItems = (items, category, basePrice = 1000) => {
        return items.map((name, index) => ({
            id: id++,
            name: name,
            price: basePrice + (index * 50),
            image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=300&h=400&fit=crop`,
            category: category,
            description: `Premium quality ${name.toLowerCase()} made with finest materials and craftsmanship`,
            rating: (3.5 + Math.random() * 1.5).toFixed(1),
            reviews: Math.floor(Math.random() * 500) + 10,
            colors: ['Red', 'Blue', 'Green', 'Black', 'White'].slice(0, Math.floor(Math.random() * 3) + 2),
            sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'].slice(0, Math.floor(Math.random() * 4) + 3),
            inStock: Math.random() > 0.1,
            discount: Math.floor(Math.random() * 30),
            brand: ['Fashion Hub', 'Style Central', 'Trendy Wear', 'Classic Collection', 'Modern Boutique'][Math.floor(Math.random() * 5)],
            material: ['Cotton', 'Silk', 'Polyester', 'Linen', 'Wool'][Math.floor(Math.random() * 5)],
            care: 'Machine wash cold, tumble dry low',
            origin: 'India',
            weight: `${Math.floor(Math.random() * 500) + 100}g`,
            dimensions: `${Math.floor(Math.random() * 50) + 30}cm x ${Math.floor(Math.random() * 70) + 40}cm`
        }));
    };

    // Create items for each category (exactly 100 items each)
    const categories = [
        { items: traditionalWomensWear, name: "Traditional Women's Wear", price: 1500 },
        { items: traditionalMensWear, name: "Traditional Men's Wear", price: 1200 },
        { items: innerwear, name: "Innerwear", price: 500 },
        { items: modernWear, name: "Modern Wear", price: 800 },
        { items: unisex, name: "Unisex", price: 1000 },
        { items: festivalWear, name: "Festival Wear", price: 2000 },
        { items: seasonalWear, name: "Seasonal Wear", price: 1300 },
        { items: fabricTypes, name: "Fabric Specials", price: 900 },
        { items: fusionWear, name: "Fusion Wear", price: 1800 },
        { items: accessories, name: "Accessories", price: 300 }
    ];

    categories.forEach(category => {
        // Ensure exactly 100 items per category
        let itemsToAdd = category.items.slice(0, 100);
        
        // If less than 100, pad with duplicates
        while (itemsToAdd.length < 100) {
            const remaining = 100 - itemsToAdd.length;
            const toDuplicate = category.items.slice(0, Math.min(remaining, category.items.length));
            itemsToAdd.push(...toDuplicate.map(item => `${item} Variant`));
        }
        
        clothingCatalog.push(...createClothingItems(itemsToAdd.slice(0, 100), category.name, category.price));
        console.log(`Added ${itemsToAdd.slice(0, 100).length} items for ${category.name}`);
    });

    console.log(`Created ${clothingCatalog.length} clothing items across 10 categories`);
    
    // Verify we have exactly 1000 items
    if (clothingCatalog.length !== 1000) {
        console.error(`Error: Expected 1000 items, but created ${clothingCatalog.length} items`);
        return;
    }

    // Save to file
    fs.writeFileSync('frontend/src/data/clothing-catalog.json', JSON.stringify(clothingCatalog, null, 2));
    console.log('✅ Successfully created exact 1000 clothing items catalog');
    console.log('📁 Saved to: frontend/src/data/clothing-catalog.json');
    
    // Print category breakdown
    const categoryBreakdown = {};
    clothingCatalog.forEach(item => {
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    });
    
    console.log('\n📊 Category Breakdown:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
        console.log(`${category}: ${count} items`);
    });
};

// Run the function
createExact1000Catalog();
