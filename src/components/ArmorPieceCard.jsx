import React, { useEffect } from 'react';
import { useArmor } from '../contexts/ArmorContext';

function ArmorPieceCard({ slot, data, jobId, armorType }) {
  const {
    getCurrentTier,
    getStepProgress,
    incrementRequirementCount,
    decrementRequirementCount,
    upgradeToNextTier,
    debug
  } = useArmor();

  const currentTier = getCurrentTier(jobId, armorType, slot);
  const currentUpgrade = data?.UpgradePath?.[currentTier];
  const hasNextTier = data?.UpgradePath?.length > currentTier;

  // Parse requirements as objects
  const requirements = currentUpgrade?.requirements ?? [];
  const stepProgress = getStepProgress(jobId, armorType, slot, currentTier);

  // Calculate if all requirements are met for upgrade
  const canUpgrade = requirements.length > 0 &&
    requirements.every(req => (stepProgress[req.item] || 0) >= req.quantity);

  // Calculate progress percentage
  const totalRequired = requirements.reduce((sum, req) => sum + req.quantity, 0);
  const totalCompleted = requirements.reduce((sum, req) => sum + Math.min(stepProgress[req.item] || 0, req.quantity), 0);
  const progressPercentage = totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0;

  useEffect(() => {
    if (debug) {
      console.log('ArmorPiece Data:', {
        slot,
        currentTier,
        currentUpgrade,
        requirements,
        stepProgress,
        canUpgrade,
        data
      });
    }
  }, [slot, currentTier, currentUpgrade, requirements, stepProgress, canUpgrade, data, debug]);

  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold capitalize">{slot}</h3>
        <div className="text-sm text-gray-600">
          Tier: {currentTier}
        </div>
      </div>

      <div className="text-sm mb-2">
        {currentTier === 0 ? data.Base : currentUpgrade?.name}
      </div>

      {/* Progress bar */}
      {requirements.length > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {hasNextTier ? (
        <div className="space-y-4">
          <h4 className="text-md font-medium">Requirements for next tier:</h4>
          <ul className="space-y-2">
            {requirements.map((req) => (
              <li key={req.item} className="flex items-center space-x-2">
                <span className={stepProgress[req.item] >= req.quantity ? 'text-gray-500' : ''}>
                  {req.item}: {stepProgress[req.item] || 0} / {req.quantity}
                </span>
                <button
                  className="ml-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => decrementRequirementCount(jobId, armorType, slot, currentTier, req.item)}
                  disabled={(stepProgress[req.item] || 0) <= 0}
                  aria-label={`Decrease ${req.item}`}
                >
                  −
                </button>
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => incrementRequirementCount(jobId, armorType, slot, currentTier, req.item)}
                  disabled={(stepProgress[req.item] || 0) >= req.quantity}
                  aria-label={`Increase ${req.item}`}
                >
                  +
                </button>
              </li>
            ))}
          </ul>

          {canUpgrade && (
            <button
              onClick={() => upgradeToNextTier(jobId, armorType, slot, currentTier + 1)}
              className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Upgrade to Next Tier
            </button>
          )}
        </div>
      ) : (
        <div className="text-gray-600 italic">
          Max tier reached
        </div>
      )}
    </div>
  );
}

export default ArmorPieceCard;