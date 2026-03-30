import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  const categoriesList = [
    { id: null, name: 'All Parts', icon: '🔧' },
    ...categories
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3">Categories</h3>
      <div className="flex flex-wrap gap-2">
        {categoriesList.map(category => (
          <button
            key={category.id || 'all'}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
