// High-quality stock image URLs for truck parts (Unsplash, Pexels, etc.)
export const truckPartImages = {
  // Engine Parts
  engine: [
    'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop'
  ],
  
  // Transmission
  transmission: [
    'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop'
  ],
  
  // Brake Parts
  brake: [
    'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop'
  ],
  
  // Suspension
  suspension: [
    'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop'
  ],
  
  // Electrical
  electrical: [
    'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop'
  ]
};

// Get random image for category
export const getCategoryImage = (categoryId) => {
  const categories = {
    1: 'engine',
    2: 'transmission',
    3: 'brake',
    4: 'suspension',
    5: 'electrical',
    6: 'clutch',
    7: 'instruments',
    8: 'accessories'
  };
  
  const category = categories[categoryId];
  const images = truckPartImages[category] || truckPartImages.engine;
  return images[Math.floor(Math.random() * images.length)];
};

// Get brand-specific image
export const getBrandImage = (brand) => {
  const brandImages = {
    'Tata Motors': 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop',
    'Ashok Leyland': 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop',
    'Mahindra': 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop',
    'BharatBenz': 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop',
    'Eicher': 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop'
  };
  
  return brandImages[brand] || 'https://images.unsplash.com/photo-1581092335871-4e1e5f5f8e6c?w=600&h=400&fit=crop';
};
