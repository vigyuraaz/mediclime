import React from 'react';

export default function SupplementFactsTable({ product }) {
  if (!product) return null;

  const facts = product.supplement_facts || [];

  return (
    <div className="bg-white border-2 border-slate-900 p-6 rounded-2xl max-w-md mx-auto shadow-md font-sans">
      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight border-b-8 border-slate-900 pb-1">
        Supplement Facts
      </h3>
      
      <div className="py-2 text-xs text-slate-700 border-b border-slate-900 flex justify-between font-semibold">
        <span>Serving Size: {product.serving_size || '2 Capsules'}</span>
        <span>Servings Per Container: 30</span>
      </div>

      <div className="py-1 text-[11px] font-bold text-slate-900 border-b-4 border-slate-900 flex justify-between uppercase tracking-wider">
        <span>Amount Per Serving</span>
        <span>% Daily Value*</span>
      </div>

      <div className="divide-y divide-slate-200">
        {facts.map((item, idx) => (
          <div key={idx} className="py-2 flex justify-between text-xs items-center">
            <span className="font-medium text-slate-800">
              {item.ingredient_name}
            </span>
            <div className="flex gap-4 font-semibold text-slate-900">
              <span>{item.amount}</span>
              <span className="w-12 text-right">{item.daily_value || '**'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t-4 border-slate-900 text-[10px] text-slate-500 leading-tight">
        <p>* Percent Daily Values are based on a 2,000 calorie diet.</p>
        <p>** Daily Value (DV) not established.</p>
      </div>

      {product.allergens && (
        <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-600 font-medium">
          <strong>Allergen Info:</strong> {product.allergens}
        </div>
      )}
    </div>
  );
}
