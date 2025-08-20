// src/components/ArmorItem.jsx
import React, { useState } from 'react';
import { useArmor } from '../contexts/ArmorContext';

function ArmorItem({ item, slot, armorType }) {
  const { 
    getStepProgress,
    incrementRequirementCount,
    decrementRequirementCount,
    toggleRequirement,
    setRequirementCount,
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

  const renderUpgradePath = (path, index) => {
    // Get the base item name from currentTiers if this is an upgraded item
    const baseItemName = Object.entries(currentTiers[item.Job]?.[armorType] || {}).find(
      ([, value]) => value === item.Name
    )?.[0] || item.Name;
    
    // Use path.name as the itemName for all state reads and updates for this upgrade tier
    const completed = isUpgradeComplete(item.Job, armorType, path.name, path.name);
    const stepProgress = getStepProgress(item.Job, armorType, path.name, path.name);
    const progress = calculateProgress(item.Job, armorType, path.name, path.name, path.requirements);

    if (completed) {
      return null; // Don't render completed upgrades as we'll show the new item instead
    }

    const renderRequirements = (path) => (
      <div className="mt-3 space-y-2">
        {path.requirements.map((req, reqIndex) => {
          const reqKey = typeof req === 'string' ? req : req.item;
          const requiredQty = typeof req === 'string' ? 1 : req.quantity;
          const isSingle = requiredQty === 1;
          const currentQty = isSingle ? !!stepProgress[reqKey] : stepProgress[reqKey] || 0;
          const isComplete = isSingle ? !!stepProgress[reqKey] : currentQty >= requiredQty;
          // Handler for checkbox change
          const handleCheckboxChange = (e) => {
            if (isSingle) {
              toggleRequirement(item.Job, armorType, path.name, path.name, reqKey);
            } else {
              // For multi-quantity: check sets to requiredQty, uncheck sets to 0
              const checked = e.target.checked;
              setRequirementCount(item.Job, armorType, path.name, path.name, reqKey, checked ? requiredQty : 0);
            }
          };
          return (
            <div key={reqIndex} className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 transition-colors duration-200 ${isComplete ? 'bg-green-50' : ''}`}>
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 rounded transition-colors duration-200"
                checked={isComplete}
                onChange={handleCheckboxChange}
                aria-label={`Mark ${reqKey} as complete`}
              />
              <span className={isComplete ? 'text-green-700 font-semibold flex items-center' : 'text-gray-700'}>
                {typeof req === 'string' ? req : req.item}
                {isSingle ? '' : `: ${currentQty} / ${requiredQty}`}
                {isComplete && (
                  <span className="ml-2 text-green-500" title="Complete">&#10003;</span>
                )}
              </span>
              {!isSingle && (
                <>
                  <button
                    className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => {
                      decrementRequirementCount(item.Job, armorType, path.name, path.name, reqKey);
                    }}
                    disabled={currentQty <= 0}
                    aria-label={`Decrease ${reqKey}`}
                  >
                    −
                  </button>
                  <button
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={() => {
                      incrementRequirementCount(item.Job, armorType, path.name, path.name, reqKey);
                    }}
                    disabled={currentQty >= requiredQty}
                    aria-label={`Increase ${reqKey}`}
                  >
                    +
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    );

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
        {renderRequirements(path)}
      </div>
    );
  };

  // Render all upgrade paths for this item, skipping completed ones
  const renderAllUpgradePaths = () => {
    if (!item.upgradePaths || item.upgradePaths.length === 0) return null;
    // Check if all upgrade paths are completed
    const allCompleted = item.upgradePaths.every(path =>
      isUpgradeComplete(item.Job, armorType, path.name, path.name)
    );
    if (allCompleted) return null; // Only show name and icon in main render
    return item.upgradePaths.map((path, index) => {
      const baseItemName = Object.entries(currentTiers[item.Job]?.[armorType] || {}).find(
        ([, value]) => value === item.Name
      )?.[0] || item.Name;
      const completed = isUpgradeComplete(item.Job, armorType, path.name, path.name);
      if (completed) return null;
      const stepProgress = getStepProgress(item.Job, armorType, path.name, path.name);
      const progress = calculateProgress(item.Job, armorType, path.name, path.name, path.requirements);
      const renderRequirements = (path) => (
        <div className="mt-3 space-y-2">
          {path.requirements.map((req, reqIndex) => {
            const reqKey = typeof req === 'string' ? req : req.item;
            const requiredQty = typeof req === 'string' ? 1 : req.quantity;
            const isSingle = requiredQty === 1;
            const currentQty = isSingle ? !!stepProgress[reqKey] : stepProgress[reqKey] || 0;
            const isComplete = isSingle ? !!stepProgress[reqKey] : currentQty >= requiredQty;
            const handleCheckboxChange = (e) => {
              if (isSingle) {
                toggleRequirement(item.Job, armorType, path.name, path.name, reqKey);
              } else {
                const checked = e.target.checked;
                setRequirementCount(item.Job, armorType, path.name, path.name, reqKey, checked ? requiredQty : 0);
              }
            };
            return (
              <div key={reqIndex} className={`flex items-center space-x-2 p-2 rounded hover:bg-gray-200 transition-colors duration-200 ${isComplete ? 'bg-green-50' : ''}`}>
                <input
                  type="checkbox"
                  className="form-checkbox h-4 w-4 text-blue-600 rounded transition-colors duration-200"
                  checked={isComplete}
                  onChange={handleCheckboxChange}
                  aria-label={`Mark ${reqKey} as complete`}
                />
                <span className={isComplete ? 'text-green-700 font-semibold flex items-center' : 'text-gray-700'}>
                  {typeof req === 'string' ? req : req.item}
                  {isSingle ? '' : `: ${currentQty} / ${requiredQty}`}
                  {isComplete && (
                    <span className="ml-2 text-green-500" title="Complete">&#10003;</span>
                  )}
                </span>
                {!isSingle && (
                  <>
                    <button
                      className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => {
                        decrementRequirementCount(item.Job, armorType, path.name, path.name, reqKey);
                      }}
                      disabled={currentQty <= 0}
                      aria-label={`Decrease ${reqKey}`}
                    >
                      −
                    </button>
                    <button
                      className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => {
                        incrementRequirementCount(item.Job, armorType, path.name, path.name, reqKey);
                      }}
                      disabled={currentQty >= requiredQty}
                      aria-label={`Increase ${reqKey}`}
                    >
                      +
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      );

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
          {renderRequirements(path)}
        </div>
      );
    });
  };

  // Determine the current upgrade path for this item
  let currentUpgradePath = null;
  if (item.upgradePaths && item.upgradePaths.length > 0) {
    // Find the upgrade path that matches the current item name
    currentUpgradePath = item.upgradePaths.find(path => path.name === item.Name);
    // If not found, fallback to the first upgrade path
    if (!currentUpgradePath) {
      currentUpgradePath = item.upgradePaths[0];
    }
  }

  // Remove isAtFinalTier logic and always render upgrade paths except completed ones
  // Only render the current upgrade path's requirements
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
                  ([, value]) => value === item.Name
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
      {/* Render all incomplete upgrade paths for this item, unless all are completed */}
      {renderAllUpgradePaths()}
    </div>
  );
}

export default ArmorItem;
