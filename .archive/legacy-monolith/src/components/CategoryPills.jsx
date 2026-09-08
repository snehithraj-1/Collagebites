import React from 'react';
import { FOOD_CATEGORIES } from '../data/campusFoodData';

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar py-2">
      <div className="flex items-center gap-2.5 min-w-max">
        {FOOD_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-md shadow-[#FF5722]/30 scale-[1.02]'
                  : 'bg-white text-[#475569] border-[#F1EAE4] hover:border-[#FF5722]/40 hover:bg-[#FFF8F5]'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
