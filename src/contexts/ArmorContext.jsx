// src/contexts/ArmorContext.jsx
import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ArmorContext = createContext();

export function ArmorProvider({ children }) {
  const [progression, setProgression] = useLocalStorage('ffxi-armor-progression', {});
  const [completedUpgrades, setCompletedUpgrades] = useLocalStorage('ffxi-completed-upgrades', {});
  const [currentTiers, setCurrentTiers] = useLocalStorage('ffxi-current-tiers', {});

  const toggleRequirement = (jobName, armorType, itemName, step, requirement) => {
    setProgression(prev => {
      const jobProgress = prev[jobName] || {};
      const armorProgress = jobProgress[armorType] || {};
      const itemProgress = armorProgress[itemName] || {};
      const stepProgress = itemProgress[step] || {};

      return {
        ...prev,
        [jobName]: {
          ...jobProgress,
          [armorType]: {
            ...armorProgress,
            [itemName]: {
              ...itemProgress,
              [step]: {
                ...stepProgress,
                [requirement]: !stepProgress[requirement]
              }
            }
          }
        }
      };
    });
  };

  const getStepProgress = (jobName, armorType, itemName, step) => {
    return progression[jobName]?.[armorType]?.[itemName]?.[step] || {};
  };

  const calculateProgress = (jobName, armorType, itemName, step, requirements) => {
    const stepProgress = getStepProgress(jobName, armorType, itemName, step);
    let completedCount = 0;
    let totalRequirements = 0;

    requirements.forEach(req => {
      const reqKey = typeof req === 'string' ? req : `${req.item}_${req.quantity}`;
      if (stepProgress[reqKey]) {
        completedCount++;
      }
      totalRequirements++;
    });

    return totalRequirements > 0 ? (completedCount / totalRequirements) * 100 : 0;
  };

  const isUpgradeComplete = (jobName, armorType, itemName, step) => {
    return completedUpgrades[jobName]?.[armorType]?.[itemName]?.[step] || false;
  };

  const completeUpgrade = (jobName, armorType, itemName, step, nextTierName) => {
    setCompletedUpgrades(prev => {
      const jobUpgrades = prev[jobName] || {};
      const armorUpgrades = jobUpgrades[armorType] || {};
      const itemUpgrades = armorUpgrades[itemName] || {};

      return {
        ...prev,
        [jobName]: {
          ...jobUpgrades,
          [armorType]: {
            ...armorUpgrades,
            [itemName]: {
              ...itemUpgrades,
              [step]: true
            }
          }
        }
      };
    });

    // Update current tier
    if (nextTierName) {
      setCurrentTiers(prev => {
        const jobTiers = prev[jobName] || {};
        const armorTiers = jobTiers[armorType] || {};
        const baseItemName = Object.keys(armorTiers).find(key => armorTiers[key] === itemName) || itemName;

        return {
          ...prev,
          [jobName]: {
            ...jobTiers,
            [armorType]: {
              ...armorTiers,
              [baseItemName]: nextTierName
            }
          }
        };
      });
    }

    // Clear the requirements progress for this step since it's now complete
    setProgression(prev => {
      const newPrev = { ...prev };
      if (newPrev[jobName]?.[armorType]?.[itemName]?.[step]) {
        delete newPrev[jobName][armorType][itemName][step];
      }
      return newPrev;
    });
  };

  const resetProgress = (jobName, armorType, itemName) => {
    // Reset requirements progress
    setProgression(prev => {
      const newProgression = { ...prev };
      if (newProgression[jobName]?.[armorType]?.[itemName]) {
        delete newProgression[jobName][armorType][itemName];
      }
      return newProgression;
    });

    // Reset completed upgrades
    setCompletedUpgrades(prev => {
      const newCompleted = { ...prev };
      if (newCompleted[jobName]?.[armorType]?.[itemName]) {
        delete newCompleted[jobName][armorType][itemName];
      }
      return newCompleted;
    });

    // Reset current tier
    setCurrentTiers(prev => {
      const jobTiers = prev[jobName] || {};
      const armorTiers = jobTiers[armorType] || {};
      if (armorTiers[itemName]) {
        const newArmorTiers = { ...armorTiers };
        delete newArmorTiers[itemName];
        return {
          ...prev,
          [jobName]: {
            ...jobTiers,
            [armorType]: newArmorTiers
          }
        };
      }
      return prev;
    });
  };

  return (
    <ArmorContext.Provider value={{
      progression,
      toggleRequirement,
      getStepProgress,
      calculateProgress,
      resetProgress,
      isUpgradeComplete,
      completeUpgrade,
      currentTiers
    }}>
      {children}
    </ArmorContext.Provider>
  );
}

export function useArmor() {
  const context = useContext(ArmorContext);
  if (!context) {
    throw new Error('useArmor must be used within an ArmorProvider');
  }
  return context;
}