// src/components/ArmorTypeSelector.jsx
import React from 'react';
import { useArmor } from '../contexts/ArmorContext';

const ARMOR_TYPES = ['Artifact', 'Relic', 'Empyrean'];

function ArmorTypeSelector() {
  const { 
    selectedJob,
    selectedType,
    setSelectedType
  } = useArmor();

  if (!selectedJob) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-400">Select Armor Type</h2>
        <div className="text-gray-500">Please select a job first</div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-3">Select Armor Type</h2>
      <div className="flex flex-wrap gap-3">
        {ARMOR_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`
              px-6 py-3 rounded-lg transition-all duration-200
              ${selectedType === type
                ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow'
              }
            `}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ArmorTypeSelector;