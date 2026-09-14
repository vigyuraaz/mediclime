import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { name: 'Nervous Health', slug: 'peripheral-neuropathy', icon: '⚡' },
  { name: 'Metabolic & Sugar', slug: 'metabolic-syndrome-glucose', icon: '🩸' },
  { name: 'Deep Rest & Sleep', slug: 'sleep-latency-insomnia', icon: '🌙' },
  { name: 'Joints & Cartilage', slug: 'osteoarthritis-joint-cartilage', icon: '🦴' },
  { name: 'Cardiovascular Health', slug: 'hypertension-endothelial', icon: '❤️' },
  { name: 'Digestive & Microbiome', slug: 'gut-dysbiosis-ibs', icon: '🌿' },
  { name: 'Immune & Cytokines', slug: 'autoimmune-inflammation-crp', icon: '🛡️' },
  { name: 'Cognitive & Memory', slug: 'cognitive-fog-neurogenesis', icon: '🧠' }
];

export default function CategoryPills({ selectedCategory, onSelectCategory }) {
  return (
    <div className="py-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2.5 min-w-max pb-2">
        <button
          onClick={() => onSelectCategory && onSelectCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            !selectedCategory
              ? 'bg-[#0F6265] text-white shadow-md shadow-teal-900/20 scale-105'
              : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-300'
          }`}
        >
          All Topics
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelectCategory && onSelectCategory(cat.name)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === cat.name
                ? 'bg-[#0F6265] text-white shadow-md shadow-teal-900/20 scale-105'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-300'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
