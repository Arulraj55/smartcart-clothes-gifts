/* eslint-disable unicode-bom */
import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

// The 500 gift items provided by the user
const giftItems = [
  "Personalized mug", "Custom photo frame", "Engraved keychain", "Handmade scented candle", "Leather wallet",
  "Silk scarf", "Gourmet chocolate box", "Wireless earbuds", "Bluetooth speaker", "Handcrafted jewelry box",
  "Personalized notebook", "Monogrammed tote bag", "Glass terrarium", "Crystal wine glasses", "Bamboo cutting board",
  "Organic skincare set", "Travel backpack", "Engraved wine opener", "Handmade soap set", "Cashmere sweater",
  "Decorative wall clock", "Portable phone charger", "Photo collage canvas", "Customized calendar", "Wooden music box",
  "Engraved pen set", "Leather journal", "Hand-painted vase", "Personalized cushion cover", "Custom phone case",
  "Sterling silver necklace", "Artisanal tea sampler", "Luxury bathrobe", "Spa gift basket", "Digital photo frame",
  "Customized apron", "Aromatherapy essential oils", "Embroidered handkerchiefs", "Custom bobblehead", "Personalized cheese board",
  "Handmade dreamcatcher", "Pocket watch", "Stainless steel water bottle", "Mini indoor plant", "Custom baby blanket",
  "Personalized recipe book", "Wooden chess set", "Monogrammed bath towel", "Handmade ceramic bowl", "Leather belt",
  "Engraved locket", "Hand-knitted blanket", "Personalized yoga mat", "Silk tie", "Gold-plated bookmark",
  "Custom travel map", "Crystal perfume bottle", "Handmade leather pouch", "Magnetic photo holder", "Personalized dog collar",
  "Pet portrait", "Coffee subscription box", "Engraved champagne flutes", "Handmade incense holder", "Leather cardholder",
  "Embroidered tote bag", "Custom coasters", "Photo snow globe", "Glass tea infuser", "Personalized wine bottle label",
  "Luxury fountain pen", "Silk eye mask", "Handmade quilt", "Leather camera strap", "Customized cookie jar",
  "Photo jigsaw puzzle", "Gourmet spice set", "Wooden serving tray", "Personalized baby onesie", "Customized passport cover",
  "Gold cufflinks", "Monogrammed throw pillow", "Engraved hip flask", "Personalized cutting board", "Luxury candle set",
  "Bamboo wine rack", "Custom reusable bag", "Wooden beer caddy", "Hand-carved figurine", "Photo wall clock",
  "Personalized wedding album", "Handcrafted wind chime", "Crystal decanter", "Leather laptop sleeve", "Engraved jewelry dish",
  "Personalized stationery set", "Decorative lantern", "Handmade macrame hanger", "Wooden wall art", "Luxury watch",
  "Personalized photo book", "Engraved bracelet", "Custom laptop bag", "Monogrammed apron", "Bamboo desk organizer",
  "Custom name necklace", "Decorative bookends", "Crystal chandelier ornament", "Personalized cookie tin", "Photo calendar magnet",
  "Engraved travel mug", "Wooden pen holder", "Silk kimono", "Leather toiletry bag", "Handmade mosaic mirror",
  "Luxury face mask set", "Personalized charm bracelet", "Engraved pocket knife", "Hand-painted tea set", "Customized fridge magnets",
  "Wooden jewelry organizer", "Embroidered cushion", "Custom baby shoes", "Engraved compact mirror", "Personalized baking kit",
  "Leather phone wallet", "Decorative photo album", "Handmade table runner", "Crystal earrings", "Custom beer mug",
  "Monogrammed cosmetic bag", "Personalized travel pillow", "Wooden keepsake box", "Hand-woven basket", "Engraved shot glasses",
  "Customized recipe box", "Luxury bath salts", "Personalized crystal award", "Wooden rocking horse", "Custom tote with quote",
  "Handcrafted candle holder", "Engraved desk clock", "Monogrammed slippers", "Custom luggage tag", "Silk tablecloth",
  "Handmade wine stopper", "Personalized bookmark", "Wooden spice rack", "Photo blanket", "Custom cookie cutter",
  "Engraved door sign", "Personalized garden tools", "Leather gloves", "Monogrammed table napkins", "Custom Christmas ornament",
  "Wooden charcuterie board", "Personalized spice jars", "Engraved cheese knives", "Handcrafted pottery mug", "Decorative glass bowl",
  "Custom makeup brush set", "Leather watch strap", "Personalized wall art", "Wooden key holder", "Engraved ruler",
  "Luxury shaving kit", "Monogrammed robe", "Handmade birdhouse", "Personalized apron set", "Custom embroidery hoop art",
  "Photo fridge magnet", "Engraved key holder", "Wooden napkin holder", "Personalized wall calendar", "Luxury soap dispenser",
  "Custom watch box", "Leather notebook cover", "Decorative candle lantern", "Bamboo serving spoons", "Engraved wine glass set",
  "Personalized baby photo album", "Crystal necklace", "Handmade bath bomb set", "Monogrammed pillowcase", "Custom sports bottle",
  "Wooden egg holder", "Personalized garden bench", "Engraved keepsake frame", "Handmade leather bracelet", "Silk table runner",
  "Custom photo blanket", "Wooden coat rack", "Personalized ice bucket", "Engraved trophy", "Leather coin purse",
  "Decorative cushion set", "Monogrammed wine tote", "Handmade hand fan", "Crystal brooch", "Personalized wine crate",
  "Custom lunch box", "Wooden bread board", "Engraved jewelry box", "Luxury skincare hamper", "Photo luggage cover",
  "Handmade knitted scarf", "Personalized cocktail shaker", "Leather crossbody bag", "Custom desk calendar", "Wooden candle stand",
  "Monogrammed tea towels", "Handmade soap dish", "Personalized picnic basket", "Engraved money clip", "Crystal paperweight",
  "Decorative serving bowl", "Custom kitchen apron", "Wooden business card holder", "Leather bracelet", "Personalized whisky glass",
  "Monogrammed dishcloths", "Hand-painted wall plate", "Engraved leather bookmark", "Wooden picture frame", "Personalized sports cap",
  "Crystal champagne bucket", "Handmade ceramic mug", "Leather travel pouch", "Custom bath towel", "Monogrammed yoga towel",
  "Wooden rolling pin", "Personalized cookie gift box", "Engraved phone stand", "Silk pocket square", "Handmade wine glass charms",
  "Leather key pouch", "Photo tote bag", "Custom cupcake topper set", "Wooden salt cellar", "Engraved office nameplate",
  "Personalized candle tin", "Leather bookmark", "Monogrammed blanket", "Handmade beaded bracelet", "Crystal table lamp",
  "Custom baby bib", "Wooden cigar box", "Personalized coatrack hook", "Engraved wall plaque", "Decorative wall shelf",
  "Leather coin wallet", "Custom engraved ring", "Bamboo bath caddy", "Monogrammed bath mat", "Handmade fabric basket",
  "Personalized yoga block", "Wooden picture ledge", "Crystal pendant", "Custom jewelry tray", "Leather glasses case",
  "Engraved wine charms", "Personalized fridge decal", "Wooden recipe stand", "Handmade felt coasters", "Monogrammed hand towel",
  "Custom tote bag with photo", "Leather messenger bag", "Personalized whiskey stones", "Wooden serving bowl", "Engraved travel jewelry case",
  "Crystal napkin rings", "Handmade rattan mirror", "Monogrammed coaster set", "Custom puzzle keychain", "Leather photo album",
  "Personalized seed packets", "Wooden cutting knife", "Engraved pen holder", "Decorative tissue box", "Crystal cake stand",
  "Handmade tote bag", "Personalized golf balls", "Leather cigar case", "Custom spice blend jars", "Wooden bench",
  "Engraved pet tag", "Photo gift card", "Monogrammed duffle bag", "Handmade bread basket", "Personalized matchbox",
  "Wooden butter dish", "Leather coin keychain", "Engraved cheese slicer", "Crystal wine stopper", "Custom dog bandana",
  "Monogrammed sports towel", "Handmade lamp shade", "Personalized metal sign", "Wooden jewelry stand", "Engraved champagne bucket",
  "Leather laptop case", "Custom spice grinder", "Photo travel mug", "Monogrammed key fob", "Handmade oil diffuser",
  "Personalized gift hamper", "Wooden serving fork", "Engraved mirror compact", "Leather gym bag", "Decorative trinket box",
  "Crystal vase", "Custom fitness bottle", "Monogrammed cocktail napkins", "Handmade storage box", "Personalized guitar pick",
  "Wooden cake stand", "Engraved door knocker", "Leather cosmetic pouch", "Photo mouse pad", "Custom salt shaker",
  "Monogrammed serving tray", "Handmade table lamp", "Personalized cookie stamps", "Wooden pizza board", "Engraved watch back",
  "Leather pen case", "Crystal drink coasters", "Custom beer tap handle", "Monogrammed leather strap", "Handmade bookmark",
  "Personalized mason jar", "Wooden tea box", "Engraved dog leash hook", "Leather luggage tag", "Custom calendar magnet",
  "Photo coaster set", "Monogrammed casserole carrier", "Handmade utensil holder", "Personalized fridge magnets set", "Wooden honey dipper",
  "Engraved travel wallet", "Leather golf glove", "Decorative wall art", "Crystal bracelet", "Custom wine aerator",
  "Monogrammed champagne flutes", "Handmade fruit bowl", "Personalized door mat", "Wooden cup holder", "Engraved trophy plaque",
  "Leather passport holder", "Photo apron", "Custom car keychain", "Monogrammed leather wallet", "Handmade woven rug",
  "Personalized cheese platter", "Wooden napkin ring", "Engraved compact brush", "Leather tablet sleeve", "Crystal perfume sprayer",
  "Custom baby blanket", "Monogrammed baby towel", "Handmade tea cozy", "Personalized trivet", "Wooden bottle opener",
  "Engraved luggage tag", "Leather valet tray", "Decorative coffee table book", "Crystal shot glass", "Custom leather wristband",
  "Monogrammed tablecloth", "Handmade cork coaster", "Personalized flower pot", "Wooden pepper mill", "Engraved beer stein",
  "Leather armrest organizer", "Photo magnet board", "Custom dog collar tag", "Monogrammed wall clock", "Handmade beaded necklace",
  "Personalized soup bowl", "Wooden tissue holder", "Engraved wall hook", "Leather cross strap", "Crystal glass bowl",
  "Custom kitchen timer", "Monogrammed apron with pockets", "Handmade serving spoon", "Personalized cutting shears", "Wooden desk lamp",
  "Engraved bracelet plate", "Leather camera case", "Decorative wall panel", "Crystal photo frame", "Custom spice spoon set",
  "Monogrammed sofa cover", "Handmade storage crate", "Personalized bottle label", "Wooden shelf unit", "Engraved desk organizer",
  "Leather ID holder", "Photo scrapbook", "Custom plush toy", "Monogrammed lunch tote", "Handmade felt basket",
  "Personalized mug set", "Wooden sandwich board", "Engraved tea spoon", "Leather iPad case", "Crystal ring holder",
  "Custom candle mold", "Monogrammed pillow", "Handmade floor mat", "Personalized soap bar", "Wooden pen case",
  "Engraved bag tag", "Leather credit card holder"
];

const GiftProductCard = ({ product, onAddToCart, isAuthenticated }) => {
  // Generate realistic pricing with discounts
  const originalPrice = Math.floor(Math.random() * 3000) + 500; // ₹500-₹3500
  const discountPercent = Math.floor(Math.random() * 60) + 10; // 10-70% discount
  const currentPrice = Math.floor(originalPrice * (100 - discountPercent) / 100);
  const savings = originalPrice - currentPrice;

  // Determine gift category based on name
  const getCategory = (name) => {
    if (name.includes('baby') || name.includes('onesie') || name.includes('bib')) return 'Baby & Kids';
    if (name.includes('kitchen') || name.includes('cutting board') || name.includes('spice') || name.includes('recipe')) return 'Kitchen & Dining';
    if (name.includes('leather') || name.includes('wallet') || name.includes('belt') || name.includes('bag')) return 'Leather Goods';
    if (name.includes('jewelry') || name.includes('necklace') || name.includes('bracelet') || name.includes('earrings')) return 'Jewelry';
    if (name.includes('home') || name.includes('decor') || name.includes('wall') || name.includes('lamp')) return 'Home Decor';
    if (name.includes('bath') || name.includes('spa') || name.includes('skincare') || name.includes('soap')) return 'Bath & Beauty';
    if (name.includes('personalized') || name.includes('custom') || name.includes('engraved') || name.includes('monogrammed')) return 'Personalized';
    if (name.includes('tech') || name.includes('wireless') || name.includes('bluetooth') || name.includes('charger')) return 'Tech & Electronics';
    return 'Gifts & Accessories';
  };

  return (
    <div className="smartcart-card" style={{ height: 'fit-content', position: 'relative' }}>
      {/* Discount Badge */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: '#10b981',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        zIndex: 2
      }}>
        {discountPercent}% OFF
      </div>

      {/* Product Image Placeholder */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <div style={{
          width: '100%',
          height: '224px',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          border: '2px dashed #d1d5db',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white'
        }}>
          <div style={{
            fontSize: '3rem',
            color: 'white',
            marginBottom: '0.5rem'
          }}>
            🎁
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: 'white',
            textAlign: 'center',
            padding: '0 1rem',
            fontWeight: '500'
          }}>
            {product.name}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '0.25rem'
          }}>
            Perfect Gift Item
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div style={{ padding: '1rem' }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '0.5rem',
          lineHeight: '1.4'
        }}>
          {product.name}
        </h3>
        
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{ 
            backgroundColor: '#ddd6fe', 
            color: '#7c3aed', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '12px', 
            fontSize: '0.75rem',
            fontWeight: '500'
          }}>
            {getCategory(product.name.toLowerCase())}
          </span>
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
            ₹{currentPrice.toLocaleString()}
          </span>
          <span style={{ 
            fontSize: '0.875rem', 
            color: '#6b7280', 
            textDecoration: 'line-through',
            marginLeft: '0.5rem'
          }}>
            ₹{originalPrice.toLocaleString()}
          </span>
        </div>

        <div style={{ 
          fontSize: '0.75rem', 
          color: '#059669', 
          fontWeight: '500',
          marginBottom: '1rem'
        }}>
          You save ₹{savings.toLocaleString()}!
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => isAuthenticated ? onAddToCart(product, currentPrice) : alert('Please log in to add items to cart')}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

const FilterModal = ({ isOpen, onClose, onApplyFilters }) => {
  const [tempFilters, setTempFilters] = useState({
    category: '',
    priceRange: '',
    discount: ''
  });

  if (!isOpen) return null;

  const handleApply = () => {
    onApplyFilters(tempFilters);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Filter Gifts</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Category
          </label>
          <select
            value={tempFilters.category}
            onChange={(e) => setTempFilters(prev => ({ ...prev, category: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Categories</option>
            <option value="Baby & Kids">Baby & Kids</option>
            <option value="Kitchen & Dining">Kitchen & Dining</option>
            <option value="Leather Goods">Leather Goods</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Home Decor">Home Decor</option>
            <option value="Bath & Beauty">Bath & Beauty</option>
            <option value="Personalized">Personalized</option>
            <option value="Tech & Electronics">Tech & Electronics</option>
            <option value="Gifts & Accessories">Gifts & Accessories</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Price Range
          </label>
          <select
            value={tempFilters.priceRange}
            onChange={(e) => setTempFilters(prev => ({ ...prev, priceRange: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">All Prices</option>
            <option value="0-500">Under ₹500</option>
            <option value="500-1000">₹500 - ₹1,000</option>
            <option value="1000-2000">₹1,000 - ₹2,000</option>
            <option value="2000-3000">₹2,000 - ₹3,000</option>
            <option value="3000+">Above ₹3,000</option>
          </select>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Minimum Discount
          </label>
          <select
            value={tempFilters.discount}
            onChange={(e) => setTempFilters(prev => ({ ...prev, discount: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Any Discount</option>
            <option value="10">10% or more</option>
            <option value="25">25% or more</option>
            <option value="50">50% or more</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setTempFilters({ category: '', priceRange: '', discount: '' })}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#10b981',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const GiftsPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    discount: ''
  });

  const itemsPerPage = 20;

  // Convert gift items array to objects with additional properties
  const processedGifts = useMemo(() => {
    return giftItems.map((item, index) => {
      const originalPrice = Math.floor(Math.random() * 3000) + 500;
      const discountPercent = Math.floor(Math.random() * 60) + 10;
      const currentPrice = Math.floor(originalPrice * (100 - discountPercent) / 100);
      
      // Determine category based on item name
      const getCategory = (name) => {
        if (name.includes('baby') || name.includes('onesie') || name.includes('bib')) return 'Baby & Kids';
        if (name.includes('kitchen') || name.includes('cutting board') || name.includes('spice') || name.includes('recipe')) return 'Kitchen & Dining';
        if (name.includes('leather') || name.includes('wallet') || name.includes('belt') || name.includes('bag')) return 'Leather Goods';
        if (name.includes('jewelry') || name.includes('necklace') || name.includes('bracelet') || name.includes('earrings')) return 'Jewelry';
        if (name.includes('home') || name.includes('decor') || name.includes('wall') || name.includes('lamp')) return 'Home Decor';
        if (name.includes('bath') || name.includes('spa') || name.includes('skincare') || name.includes('soap')) return 'Bath & Beauty';
        if (name.includes('personalized') || name.includes('custom') || name.includes('engraved') || name.includes('monogrammed')) return 'Personalized';
        if (name.includes('tech') || name.includes('wireless') || name.includes('bluetooth') || name.includes('charger')) return 'Tech & Electronics';
        return 'Gifts & Accessories';
      };

      return {
        id: index + 1,
        name: item,
        category: getCategory(item.toLowerCase()),
        originalPrice,
        currentPrice,
        discountPercent,
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0 rating
        reviews: Math.floor(Math.random() * 500) + 10
      };
    });
  }, []);

  // Filtering and searching logic
  const filteredGifts = useMemo(() => {
    return processedGifts.filter(gift => {
      const matchesSearch = gift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gift.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !filters.category || gift.category === filters.category;

      let matchesPrice = true;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(p => p.replace('+', ''));
        if (max) {
          matchesPrice = gift.currentPrice >= parseInt(min) && gift.currentPrice <= parseInt(max);
        } else {
          matchesPrice = gift.currentPrice >= parseInt(min);
        }
      }

      const matchesDiscount = !filters.discount || gift.discountPercent >= parseInt(filters.discount);

      return matchesSearch && matchesCategory && matchesPrice && matchesDiscount;
    });
  }, [processedGifts, searchTerm, filters]);

  // Sorting logic
  const sortedGifts = useMemo(() => {
    const sorted = [...filteredGifts].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.currentPrice - b.currentPrice;
          break;
        case 'discount':
          comparison = a.discountPercent - b.discountPercent;
          break;
        case 'rating':
          comparison = parseFloat(a.rating) - parseFloat(b.rating);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [filteredGifts, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedGifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGifts = sortedGifts.slice(startIndex, startIndex + itemsPerPage);

  const handleAddToCart = (gift, price) => {
    console.log('Added to cart:', gift.name, 'Price:', price);
    // Here you would typically update cart state or make an API call
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSort = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎁 Perfect Gifts Collection
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
          Discover {giftItems.length} unique and thoughtful gifts for every occasion
        </p>
      </div>

      {/* Search and Controls */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '1rem', 
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search for the perfect gift..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <div style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
            fontSize: '1.25rem'
          }}>
            🔍
          </div>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1rem', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.borderColor = '#10b981';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              🔧 Filters
            </button>

            {/* Sort Options */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Sort by:</span>
              {['name', 'price', 'discount', 'rating'].map(option => (
                <button
                  key={option}
                  onClick={() => handleSort(option)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    border: 'none',
                    borderRadius: '4px',
                    backgroundColor: sortBy === option ? '#10b981' : '#e5e7eb',
                    color: sortBy === option ? 'white' : '#374151',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.2s'
                  }}
                >
                  {option} {sortBy === option && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Showing {paginatedGifts.length} of {filteredGifts.length} gifts
          </div>
        </div>

        {/* Active Filters Display */}
        {(filters.category || filters.priceRange || filters.discount) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>Active filters:</span>
            {filters.category && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#ddd6fe',
                color: '#7c3aed',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {filters.category}
              </span>
            )}
            {filters.priceRange && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                ₹{filters.priceRange.replace('-', ' - ₹')}
              </span>
            )}
            {filters.discount && (
              <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {filters.discount}%+ off
              </span>
            )}
            <button
              onClick={() => {
                setFilters({ category: '', priceRange: '', discount: '' });
                setCurrentPage(1);
              }}
              style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Clear all ✕
            </button>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {paginatedGifts.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {paginatedGifts.map((gift) => (
            <GiftProductCard
              key={gift.id}
              product={gift}
              onAddToCart={handleAddToCart}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
            No gifts found
          </h3>
          <p style={{ fontSize: '1rem' }}>
            Try adjusting your search terms or filters to find more gifts.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '2rem'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: currentPage === 1 ? '#f9fafb' : 'white',
              color: currentPage === 1 ? '#9ca3af' : '#374151',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Previous
          </button>

          {[...Array(Math.min(totalPages, 5))].map((_, index) => {
            const pageNum = currentPage <= 3 ? index + 1 : 
                           currentPage >= totalPages - 2 ? totalPages - 4 + index : 
                           currentPage - 2 + index;
            
            if (pageNum < 1 || pageNum > totalPages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: currentPage === pageNum ? '#10b981' : 'white',
                  color: currentPage === pageNum ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  minWidth: '40px'
                }}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: currentPage === totalPages ? '#f9fafb' : 'white',
              color: currentPage === totalPages ? '#9ca3af' : '#374151',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
};

export default GiftsPage;
