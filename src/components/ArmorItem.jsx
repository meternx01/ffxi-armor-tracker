// src/components/ArmorItem.jsx
import React, { useState } from 'react';
import { useArmor } from '../contexts/ArmorContext';

function ArmorItem({ item, slot, armorType }) {
  const { 
    toggleRequirement, 
    getStepProgress, 
    calculateProgress, 
    resetProgress,
    isUpgradeComplete,
    completeUpgrade,
    currentTiers 
  } = useArmor();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const renderProgressBar = (progress) => (
    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const renderRequirement = (req) => {
    if (typeof req === 'string') return req;
    return `${req.item} x${formatNumber(req.quantity)}`;
  };

  const renderFallbackImage = () => {
    const slotColors = {
      'Head': 'bg-red-200',
      'Body': 'bg-blue-200',
      'Hands': 'bg-green-200',
      'Legs': 'bg-yellow-200',
      'Feet': 'bg-purple-200'
    };

    return (
      <div
        className={`w-24 h-24 rounded-lg ${slotColors[slot]} flex items-center justify-center shadow-md`}
        title={item.Name}
      >
        <span className="text-gray-600 text-sm font-medium">{slot}</span>
      </div>
    );
  };

  const renderArmorImage = () => (
    <div className="relative w-24 h-24">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      {imageError ? (
        renderFallbackImage()
      ) : (
        <img
          src={item.LinkURL}
          alt={`${item.Name} - ${slot} armor piece`}
          className={`w-24 h-24 object-contain rounded-lg shadow-md ${imageLoading ? 'hidden' : ''}`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
        />
      )}
    </div>
  );

  const renderUpgradePath = (path, index, totalPaths) => {
    // Get the base item name from currentTiers if this is an upgraded item
    const baseItemName = Object.entries(currentTiers[item.Job]?.[armorType] || {}).find(
      ([key, value]) => value === item.Name
    )?.[0] || item.Name;
    
    const completed = isUpgradeComplete(item.Job, armorType, baseItemName, path.name);
    const reqKeys = path.requirements.map(req => 
      typeof req === 'string' ? req : `${req.item}_${req.quantity}`
    );
    const stepProgress = getStepProgress(item.Job, armorType, baseItemName, path.name);
    const progress = calculateProgress(item.Job, armorType, baseItemName, path.name, path.requirements);

    if (completed) {
      return null; // Don't render completed upgrades as we'll show the new item instead
    }

    return (
      <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-700">{path.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            {progress === 100 && (
              <button
                onClick={() => completeUpgrade(item.Job, armorType, baseItemName, path.name, path.name)}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors duration-200"
              >
                Complete Upgrade
              </button>
            )}
          </div>
        </div>
        {renderProgressBar(progress)}
        <div className="mt-3 space-y-2">
          {path.requirements.map((req, reqIndex) => {
            const reqKey = typeof req === 'string' ? req : `${req.item}_${req.quantity}`;
            const reqDisplay = renderRequirement(req);
            const isCompleted = stepProgress[reqKey];
            
            return (
              <label 
                key={reqIndex} 
                className={`flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors duration-200 ${isCompleted ? 'bg-green-50 hover:bg-green-100' : ''}`}
              >
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 rounded transition-colors duration-200"
                  checked={stepProgress[reqKey] || false}
                  onChange={() => toggleRequirement(item.Job, armorType, baseItemName, path.name, reqKey)}
                />
                <span className={`text-sm ${isCompleted ? 'text-green-700 font-medium' : 'text-gray-700'}`}>
                  {reqDisplay}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0">
          {renderArmorImage()}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-800">{item.Name}</h3>
            <button
              onClick={() => {
                const baseItemName = Object.entries(currentTiers[item.Job]?.[armorType] || {}).find(
                  ([key, value]) => value === item.Name
                )?.[0] || item.Name;
                resetProgress(item.Job, armorType, baseItemName);
              }}
              className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
              title="Reset progress for this item"
            >
              Reset
            </button>
          </div>
          {item.Description && (
            <p className="text-gray-600 text-sm mt-1">{item.Description}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {item.upgradePaths && item.upgradePaths.map((path, index) => (
          renderUpgradePath(path, index, item.upgradePaths.length)
        ))}
      </div>
    </div>
  );
}

export default ArmorItem;