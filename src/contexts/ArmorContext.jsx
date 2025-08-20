// src/contexts/ArmorContext.jsx
import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const ArmorContext = createContext();

export function ArmorProvider({ children }) {
  // New data model: characters array and selectedCharacterId
  const [characters, setCharacters] = useLocalStorage('ffxi-armor-characters', []);
  const [selectedCharacterId, setSelectedCharacterId] = useLocalStorage('ffxi-selected-character', null);

  // Migration logic: if no characters but old progression exists, migrate
  const [legacyProgression, setLegacyProgression] = useLocalStorage('ffxi-armor-progression', null);
  const [legacyCompletedUpgrades, setLegacyCompletedUpgrades] = useLocalStorage('ffxi-completed-upgrades', null);
  const [legacyCurrentTiers, setLegacyCurrentTiers] = useLocalStorage('ffxi-current-tiers', null);

  React.useEffect(() => {
    if (characters.length === 0 && (legacyProgression || legacyCompletedUpgrades || legacyCurrentTiers)) {
      const defaultChar = {
        id: uuidv4(),
        name: 'Default',
        progression: legacyProgression || {},
        completedUpgrades: legacyCompletedUpgrades || {},
        currentTiers: legacyCurrentTiers || {}
      };
      setCharacters([defaultChar]);
      setSelectedCharacterId(defaultChar.id);
      setLegacyProgression(null);
      setLegacyCompletedUpgrades(null);
      setLegacyCurrentTiers(null);
    }
  }, [characters, legacyProgression, legacyCompletedUpgrades, legacyCurrentTiers]);

  // Helper to get selected character
  const getSelectedCharacter = () => {
    if (!characters || characters.length === 0) return {
      id: null,
      name: '',
      progression: {},
      completedUpgrades: {},
      currentTiers: {}
    };
    return characters.find(c => c.id === selectedCharacterId) || characters[0];
  };

  // Character management
  const addCharacter = (name) => {
    const newChar = {
      id: uuidv4(),
      name,
      progression: {},
      completedUpgrades: {},
      currentTiers: {}
    };
    setCharacters(prev => [...prev, newChar]);
    setSelectedCharacterId(newChar.id);
  };
  const removeCharacter = (id) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    if (selectedCharacterId === id) {
      const remaining = characters.filter(c => c.id !== id);
      setSelectedCharacterId(remaining[0]?.id || null);
    }
  };
  const renameCharacter = (id, newName) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };
  const selectCharacter = (id) => setSelectedCharacterId(id);

  // All progression functions now operate on selected character
  const updateSelectedCharacter = (updates) => {
    setCharacters(prev => prev.map(c =>
      c.id === getSelectedCharacter().id ? { ...c, ...updates } : c
    ));
  };

  // Progression functions
  const toggleRequirement = (jobName, armorType, itemName, step, requirement) => {
    const char = getSelectedCharacter();
    const progression = char.progression || {};
    const jobProgress = progression[jobName] || {};
    const armorProgress = jobProgress[armorType] || {};
    const itemProgress = armorProgress[itemName] || {};
    const stepProgress = itemProgress[step] || {};
    const newProgression = {
      ...progression,
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
    updateSelectedCharacter({ progression: newProgression });
  };

  const setRequirementCount = (jobName, armorType, itemName, step, requirement, count) => {
    const char = getSelectedCharacter();
    const progression = char.progression || {};
    const jobProgress = progression[jobName] || {};
    const armorProgress = jobProgress[armorType] || {};
    const itemProgress = armorProgress[itemName] || {};
    const stepProgress = itemProgress[step] || {};
    const newProgression = {
      ...progression,
      [jobName]: {
        ...jobProgress,
        [armorType]: {
          ...armorProgress,
          [itemName]: {
            ...itemProgress,
            [step]: {
              ...stepProgress,
              [requirement]: count
            }
          }
        }
      }
    };
    updateSelectedCharacter({ progression: newProgression });
  };

  const incrementRequirementCount = (jobName, armorType, itemName, step, requirement) => {
    const char = getSelectedCharacter();
    const progression = char.progression || {};
    const jobProgress = progression[jobName] || {};
    const armorProgress = jobProgress[armorType] || {};
    const itemProgress = armorProgress[itemName] || {};
    const stepProgress = itemProgress[step] || {};
    const currentCount = typeof stepProgress[requirement] === 'number' ? stepProgress[requirement] : 0;
    const newCount = currentCount + 1;
    const newProgression = {
      ...progression,
      [jobName]: {
        ...jobProgress,
        [armorType]: {
          ...armorProgress,
          [itemName]: {
            ...itemProgress,
            [step]: {
              ...stepProgress,
              [requirement]: newCount
            }
          }
        }
      }
    };
    updateSelectedCharacter({ progression: newProgression });
  };

  const decrementRequirementCount = (jobName, armorType, itemName, step, requirement) => {
    const char = getSelectedCharacter();
    const progression = char.progression || {};
    const jobProgress = progression[jobName] || {};
    const armorProgress = jobProgress[armorType] || {};
    const itemProgress = armorProgress[itemName] || {};
    const stepProgress = itemProgress[step] || {};
    const currentCount = typeof stepProgress[requirement] === 'number' ? stepProgress[requirement] : 0;
    const newCount = Math.max(0, currentCount - 1);
    const newProgression = {
      ...progression,
      [jobName]: {
        ...jobProgress,
        [armorType]: {
          ...armorProgress,
          [itemName]: {
            ...itemProgress,
            [step]: {
              ...stepProgress,
              [requirement]: newCount
            }
          }
        }
      }
    };
    updateSelectedCharacter({ progression: newProgression });
  };

  const getStepProgress = (jobName, armorType, itemName, step) => {
    const char = getSelectedCharacter();
    return char.progression?.[jobName]?.[armorType]?.[itemName]?.[step] || {};
  };

  const calculateProgress = (jobName, armorType, itemName, step, requirements) => {
    const stepProgress = getStepProgress(jobName, armorType, itemName, step);
    let completedCount = 0;
    let totalRequirements = 0;
    requirements.forEach(req => {
      let isComplete;
      if (typeof req === 'string') {
        isComplete = !!stepProgress[req];
      } else {
        isComplete = (stepProgress[req.item] || 0) >= req.quantity;
      }
      if (isComplete) completedCount++;
      totalRequirements++;
    });
    return totalRequirements > 0 ? (completedCount / totalRequirements) * 100 : 0;
  };

  const isUpgradeComplete = (jobName, armorType, itemName, step) => {
    const char = getSelectedCharacter();
    return char.completedUpgrades?.[jobName]?.[armorType]?.[itemName]?.[step] || false;
  };

  const completeUpgrade = (jobName, armorType, itemName, step, nextTierName) => {
    const char = getSelectedCharacter();
    const completedUpgrades = char.completedUpgrades || {};
    const jobUpgrades = completedUpgrades[jobName] || {};
    const armorUpgrades = jobUpgrades[armorType] || {};
    const itemUpgrades = armorUpgrades[itemName] || {};
    const newCompletedUpgrades = {
      ...completedUpgrades,
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
    // Update current tier
    const currentTiers = char.currentTiers || {};
    let newCurrentTiers = currentTiers;
    if (nextTierName) {
      const jobTiers = currentTiers[jobName] || {};
      const armorTiers = jobTiers[armorType] || {};
      const baseItemName = Object.keys(armorTiers).find(key => armorTiers[key] === itemName) || itemName;
      newCurrentTiers = {
        ...currentTiers,
        [jobName]: {
          ...jobTiers,
          [armorType]: {
            ...armorTiers,
            [baseItemName]: nextTierName
          }
        }
      };
    }
    // Clear requirements progress for this step
    const progression = char.progression || {};
    const newProgression = { ...progression };
    if (newProgression[jobName]?.[armorType]?.[itemName]?.[step]) {
      delete newProgression[jobName][armorType][itemName][step];
    }
    updateSelectedCharacter({
      completedUpgrades: newCompletedUpgrades,
      currentTiers: newCurrentTiers,
      progression: newProgression
    });
  };

  const resetProgress = (jobName, armorType, itemName) => {
    const char = getSelectedCharacter();
    // Reset requirements progress
    const progression = char.progression || {};
    const newProgression = { ...progression };
    if (newProgression[jobName]?.[armorType]?.[itemName]) {
      delete newProgression[jobName][armorType][itemName];
    }
    // Reset completed upgrades
    const completedUpgrades = char.completedUpgrades || {};
    const newCompleted = { ...completedUpgrades };
    if (newCompleted[jobName]?.[armorType]?.[itemName]) {
      delete newCompleted[jobName][armorType][itemName];
    }
    // Reset current tier
    const currentTiers = char.currentTiers || {};
    const jobTiers = currentTiers[jobName] || {};
    const armorTiers = jobTiers[armorType] || {};
    if (armorTiers[itemName]) {
      const newArmorTiers = { ...armorTiers };
      delete newArmorTiers[itemName];
      const newCurrentTiers = {
        ...currentTiers,
        [jobName]: {
          ...jobTiers,
          [armorType]: newArmorTiers
        }
      };
      updateSelectedCharacter({
        progression: newProgression,
        completedUpgrades: newCompleted,
        currentTiers: newCurrentTiers
      });
      return;
    }
    updateSelectedCharacter({
      progression: newProgression,
      completedUpgrades: newCompleted
    });
  };

  // Defensive wrappers for context functions
  const safeToggleRequirement = (...args) => {
    if (!characters || characters.length === 0) return;
    toggleRequirement(...args);
  };
  const safeSetRequirementCount = (...args) => {
    if (!characters || characters.length === 0) return;
    setRequirementCount(...args);
  };
  const safeIncrementRequirementCount = (...args) => {
    if (!characters || characters.length === 0) return;
    incrementRequirementCount(...args);
  };
  const safeDecrementRequirementCount = (...args) => {
    if (!characters || characters.length === 0) return;
    decrementRequirementCount(...args);
  };
  const safeGetStepProgress = (...args) => {
    if (!characters || characters.length === 0) return {};
    return getStepProgress(...args);
  };
  const safeCalculateProgress = (...args) => {
    if (!characters || characters.length === 0) return 0;
    return calculateProgress(...args);
  };
  const safeResetProgress = (...args) => {
    if (!characters || characters.length === 0) return;
    resetProgress(...args);
  };
  const safeIsUpgradeComplete = (...args) => {
    if (!characters || characters.length === 0) return false;
    return isUpgradeComplete(...args);
  };
  const safeCompleteUpgrade = (...args) => {
    if (!characters || characters.length === 0) return;
    completeUpgrade(...args);
  };

  return (
    <ArmorContext.Provider
      value={{
        characters,
        selectedCharacterId,
        addCharacter,
        removeCharacter,
        renameCharacter,
        selectCharacter,
        progression: getSelectedCharacter()?.progression || {},
        toggleRequirement: safeToggleRequirement,
        setRequirementCount: safeSetRequirementCount,
        incrementRequirementCount: safeIncrementRequirementCount,
        decrementRequirementCount: safeDecrementRequirementCount,
        getStepProgress: safeGetStepProgress,
        calculateProgress: safeCalculateProgress,
        resetProgress: safeResetProgress,
        isUpgradeComplete: safeIsUpgradeComplete,
        completeUpgrade: safeCompleteUpgrade,
        currentTiers: getSelectedCharacter()?.currentTiers || {}
      }}
    >
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