import React, { useEffect } from 'react';
import { useArmor } from '../contexts/ArmorContext';

function ArmorPieceCard({ slot, data, jobId, armorType }) {
  const { 
    getCurrentTier, 
    getCompletedRequirements, 
    toggleRequirement, 
    upgradeToNextTier,
    debug
  } = useArmor();

  const currentTier = getCurrentTier(jobId, armorType, slot);
  const completedRequirements = getCompletedRequirements(jobId, armorType, slot);
  
  // Get the current upgrade information
  const currentUpgrade = data?.UpgradePath?.[currentTier];
  const hasNextTier = data?.UpgradePath?.length > currentTier;
  
  // Calculate if all requirements are met for upgrade
  const requirements = currentUpgrade?.requirements?.split(', ') ?? [];
  const canUpgrade = requirements.length > 0 && 
    requirements.every(req => completedRequirements.includes(req));

  // Calculate progress percentage
  const progressPercentage = requirements.length > 0
    ? (completedRequirements.length / requirements.length) * 100
    : 0;

  // Debug logging
  useEffect(() => {
    if (debug) {
      console.log('ArmorPiece Data:', {
        slot,
        currentTier,
        currentUpgrade,
        requirements,
        completedRequirements,
        canUpgrade,
        data
      });
    }
  }, [slot, currentTier, currentUpgrade, requirements, completedRequirements, canUpgrade, data, debug]);

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
              <li key={req} className="flex items-center">
                <input
                  type="checkbox"
                  checked={completedRequirements.includes(req)}
                  onChange={() => toggleRequirement(jobId, armorType, slot, req, currentTier)}
                  className="w-4 h-4 mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className={completedRequirements.includes(req) ? 'text-gray-500' : ''}>
                  {req}
                </span>
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