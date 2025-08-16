import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = '/api/placeholder/400/300',
  style = {},
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImageSrc(src);
    setLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = (e) => {
    setLoading(false);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    console.warn('Image failed to load:', src);
    setLoading(false);
    setError(true);
    
    // Try fallback image
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
    
    if (onError) onError(e);
  };

  const generatePlaceholder = (width = 400, height = 300) => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='14' fill='%236b7280' text-anchor='middle' dy='.3em'%3E${alt || 'Image'}%3C/text%3E%3C/svg%3E`;
  };

  if (error && imageSrc === fallbackSrc) {
    // If even fallback fails, show a generated placeholder
    const placeholder = generatePlaceholder(
      style.width || props.width || 400,
      style.height || props.height || 300
    );
    
    return (
      <img
        src={placeholder}
        alt={alt}
        className={`${className} bg-gray-100`}
        style={style}
        {...props}
      />
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div 
          className={`absolute inset-0 bg-gray-200 animate-pulse ${className}`}
          style={style}
        />
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
