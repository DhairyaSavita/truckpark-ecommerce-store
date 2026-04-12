import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * ProductImage
 * Renders a product image with:
 *  - Uploaded image (image_url from backend) → shown first
 *  - Category-specific Unsplash placeholder if no image
 *  - Brand-specific placeholder as secondary fallback
 *  - Generic truck parts fallback as last resort
 *  - Fade-in animation on load
 *  - Skeleton shimmer while loading
 */

/* ── Category placeholders — each category has a UNIQUE, relevant image ── */
const CATEGORY_IMAGES = {
  // Engine Parts (id=1)
  1: 'https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=500&auto=format&fit=crop',
  // Brake System (id=3)
  3: 'https://images.unsplash.com/photo-1600186500707-bdb71becd3e0?w=500&auto=format&fit=crop',
  // Cooling System (id=9)
  9: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop',
  // Exhaust System (id=10)
  10: 'https://images.unsplash.com/photo-1567443024551-f3e3cc2be870?w=500&auto=format&fit=crop',
  // Transmission & Clutch (id=11)
  11: 'https://images.unsplash.com/photo-1617469767611-15c6b7960c2b?w=500&auto=format&fit=crop',
  // Suspension & Steering (id=12)
  12: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&auto=format&fit=crop',
  // Electrical & Lighting (id=13)
  13: 'https://images.unsplash.com/photo-1647872556498-4db53a90e2d9?w=500&auto=format&fit=crop',
  // Body & Cabin Parts (id=14)
  14: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop',
  // Fuel System (id=15)
  15: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop',
  // Wheels & Tyres (id=16)
  16: 'https://images.unsplash.com/photo-1567037026759-de13898c29a5?w=500&auto=format&fit=crop',
  // Filters & Lubrication (id=17)
  17: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500&auto=format&fit=crop',
  // Safety & Accessories (id=18)
  18: 'https://images.unsplash.com/photo-1449427283979-e17e0822e272?w=500&auto=format&fit=crop',
};

/* ── Brand-specific fallbacks  ── */
const BRAND_IMAGES = {
  'Tata Motors':    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&auto=format&fit=crop',
  'Ashok Leyland':  'https://images.unsplash.com/photo-1532987748424-e41dc13e6b9b?w=500&auto=format&fit=crop',
  'Mahindra':       'https://images.unsplash.com/photo-1548013146-72479768bada?w=500&auto=format&fit=crop',
  'BharatBenz':     'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=500&auto=format&fit=crop',
  'Eicher':         'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop',
  'Cummins':        'https://images.unsplash.com/photo-1563694983011-6f4d90358083?w=500&auto=format&fit=crop',
  'Bosch':          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop',
};

/* ── Fallback if nothing matches ── */
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=500&auto=format&fit=crop';

const getPlaceholder = (product) => {
  if (product?.brand && BRAND_IMAGES[product.brand]) return BRAND_IMAGES[product.brand];
  if (product?.category_id && CATEGORY_IMAGES[product.category_id]) return CATEGORY_IMAGES[product.category_id];
  // Try to infer category from category name string if id not available
  if (product?.Category?.id && CATEGORY_IMAGES[product.Category.id]) return CATEGORY_IMAGES[product.Category.id];
  return DEFAULT_IMAGE;
};

/* ── Main Component ── */
const ProductImage = ({ product, className = 'w-full h-48 object-cover', disableHoverZoom = false }) => {
  const [src, setSrc] = useState(product?.image_url || getPlaceholder(product));
  const [loaded, setLoaded] = useState(false);

  const handleError = () => {
    setSrc(getPlaceholder(product));
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 w-full h-full">
      {/* Skeleton shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      <motion.img
        key={src}
        src={src}
        alt={product?.name || 'Truck part'}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        {...(!disableHoverZoom && {
          whileHover: { scale: 1.06 },
          transition: { duration: 0.4, ease: 'easeOut' },
        })}
      />

      {/* Brand badge overlay */}
      {product?.brand && (
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-0.5 bg-black/60 text-white text-xs font-medium rounded-md backdrop-blur-sm">
            {product.brand}
          </span>
        </div>
      )}

      {/* "No image" overlay hint when using a placeholder */}
      {!product?.image_url && (
        <div className="absolute bottom-1.5 right-1.5 z-10">
          <span className="px-1.5 py-0.5 bg-black/30 text-white/80 text-[10px] rounded backdrop-blur-sm">
            No photo
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
