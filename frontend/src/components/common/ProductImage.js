import React, { useState, useEffect } from 'react';
import { getProductImage as getUnsplashImage } from '../../utils/unsplashImageService';

// Enhanced ProductImage component with Unsplash API integration
const ProductImage = ({ product, className = '', style = {}, ...props }) => {
  const [imgSrc, setImgSrc] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fallback image mappings for when Unsplash API is not available
  const getFallbackImage = (productName, category) => {
    const name = productName.toLowerCase();
    
    // Clothing-specific image mappings
    if (category === 'clothes') {
      // Women's Traditional Clothing
      if (name.includes('saree')) return 'https://images.unsplash.com/photo-1583391733981-3b7c996e8bb8?w=400&h=400&fit=crop';
      if (name.includes('lehenga')) return 'https://images.unsplash.com/photo-1594736797933-d0f06b509d4e?w=400&h=400&fit=crop';
      if (name.includes('kurti')) return 'https://images.unsplash.com/photo-1594736797933-d0f06b509d4e?w=400&h=400&fit=crop';
      if (name.includes('anarkali')) return 'https://images.unsplash.com/photo-1583391733981-3b7c996e8bb8?w=400&h=400&fit=crop';
      if (name.includes('salwar')) return 'https://images.unsplash.com/photo-1594736797933-d0f06b509d4e?w=400&h=400&fit=crop';
      if (name.includes('dupatta')) return 'https://images.unsplash.com/photo-1583391733981-3b7c996e8bb8?w=400&h=400&fit=crop';
      if (name.includes('blouse')) return 'https://images.unsplash.com/photo-1594736797933-d0f06b509d4e?w=400&h=400&fit=crop';
      
      // Men's Traditional Clothing
      if (name.includes('dhoti')) return 'https://images.unsplash.com/photo-1506629905352-b2e738e2f776?w=400&h=400&fit=crop';
      if (name.includes('kurta') && (name.includes('men') || name.includes('dhoti'))) return 'https://images.unsplash.com/photo-1506629905352-b2e738e2f776?w=400&h=400&fit=crop';
      if (name.includes('sherwani')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
      if (name.includes('achkan')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
      if (name.includes('pathani')) return 'https://images.unsplash.com/photo-1506629905352-b2e738e2f776?w=400&h=400&fit=crop';
      if (name.includes('jodhpuri')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
      
      // Innerwear/Essentials
      if (name.includes('bra')) return 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop';
      if (name.includes('jatti') || name.includes('panties')) return 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop';
      if (name.includes('boxer')) return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop';
      if (name.includes('vest') || name.includes('banian')) return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop';
      if (name.includes('thermal')) return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop';
      if (name.includes('camisole')) return 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop';
      if (name.includes('petticoat')) return 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop';
      if (name.includes('briefs')) return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop';
      
      // Modern Women's Wear
      if (name.includes('jeans') && name.includes('women')) return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop';
      if (name.includes('t-shirt') && name.includes('women')) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
      if (name.includes('crop top')) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
      if (name.includes('palazzo')) return 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop';
      if (name.includes('pencil skirt')) return 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop';
      if (name.includes('maxi dress')) return 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop';
      if (name.includes('midi dress')) return 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop';
      if (name.includes('denim jacket') && name.includes('women')) return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop';
      if (name.includes('jumpsuit')) return 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop';
      if (name.includes('tank top')) return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop';
      
      // Modern Men's Wear
      if (name.includes('jeans') && (name.includes('men') || !name.includes('women'))) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop';
      if (name.includes('shirt') && name.includes('men')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
      if (name.includes('hoodie')) return 'https://images.unsplash.com/photo-1556821840-3a9fbc86339e?w=400&h=400&fit=crop';
      if (name.includes('bomber jacket')) return 'https://images.unsplash.com/photo-1556821840-3a9fbc86339e?w=400&h=400&fit=crop';
      if (name.includes('cargo pants')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop';
      if (name.includes('shorts') && name.includes('men')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop';
      if (name.includes('polo shirt')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
      if (name.includes('blazer') && name.includes('men')) return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
      if (name.includes('chinos')) return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop';
      if (name.includes('joggers')) return 'https://images.unsplash.com/photo-1556821840-3a9fbc86339e?w=400&h=400&fit=crop';
    }
    
    // Gift category images
    if (category === 'gifts') {
      if (name.includes('toy') || name.includes('teddy') || name.includes('doll')) return 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop';
      if (name.includes('book') || name.includes('novel') || name.includes('magazine')) return 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop';
      if (name.includes('jewelry') || name.includes('necklace') || name.includes('ring')) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop';
      if (name.includes('watch') || name.includes('clock')) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop';
      if (name.includes('perfume') || name.includes('fragrance')) return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop';
      if (name.includes('candle') || name.includes('scented')) return 'https://images.unsplash.com/photo-1602874801006-add5f5ac7737?w=400&h=400&fit=crop';
      if (name.includes('flower') || name.includes('bouquet')) return 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=400&fit=crop';
      if (name.includes('chocolate') || name.includes('sweet')) return 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop';
      if (name.includes('phone') || name.includes('mobile') || name.includes('gadget')) return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop';
      if (name.includes('bag') || name.includes('purse') || name.includes('handbag')) return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop';
    }
    
    // Default fallback images
    if (category === 'clothes') {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop'; // Generic clothing
    } else {
      return 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?w=400&h=400&fit=crop'; // Generic gift
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);
        
        // Try to get image from Unsplash API
        const imageData = await getUnsplashImage(product.name, product.category);
        
        if (imageData && imageData.url) {
          setImgSrc(imageData.url);
        } else {
          // Fall back to our predefined mappings
          const fallbackSrc = getFallbackImage(product.name, product.category);
          setImgSrc(fallbackSrc);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        // Use fallback image
        const fallbackSrc = getFallbackImage(product.name, product.category);
        setImgSrc(fallbackSrc);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (product && product.name) {
      loadImage();
    }
  }, [product]);

  const handleError = () => {
    if (!error) {
      setError(true);
      // Try fallback image
      const fallbackSrc = getFallbackImage(product.name, product.category);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  // Show loading placeholder
  if (loading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={{ ...style, minHeight: '200px' }}
      >
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={product.name}
      className={className}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default ProductImage;
