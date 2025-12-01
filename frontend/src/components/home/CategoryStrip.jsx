import React from 'react';

const items = [
  { key: 'clothes-men', label: 'Men', emoji: '👔' },
  { key: 'clothes-women', label: 'Women', emoji: '👗' },
  { key: 'clothes-kids', label: 'Kids', emoji: '🧒' },
  { key: 'gifts-tech', label: 'Tech Gifts', emoji: '🎮' },
  { key: 'gifts-handmade', label: 'Handmade', emoji: '🧵' },
  { key: 'gifts-festive', label: 'Festive', emoji: '🎉' },
  { key: 'clothes-active', label: 'Activewear', emoji: '🏃' },
  { key: 'clothes-ethnic', label: 'Ethnic', emoji: '🕌' },
];

export default function CategoryStrip({ onNavigate }) {
  return (
    <div className="sc-container py-8 overflow-x-auto">
      <div className="flex gap-6 min-w-max">
        {items.map(i => (
          <button
            key={i.key}
            onClick={() => onNavigate(i.key.includes('gifts') ? 'gifts' : 'clothes')}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-white border border-pink-200 shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              {i.emoji}
            </div>
            <span className="text-xs font-medium text-gray-700 group-hover:text-pink-600 tracking-wide">{i.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
