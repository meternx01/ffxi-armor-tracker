// src/data/armorData.js
export const ARMOR_SLOTS = ['Head', 'Body', 'Hands', 'Legs', 'Feet'];

export const ARMOR_TYPES = [
  { id: 'Artifact', name: 'Artifact' },
  { id: 'Relic', name: 'Relic' },
  { id: 'Empyrean', name: 'Empyrean' }
];

export const getArmorTypeLabel = (type) => {
  const armorType = ARMOR_TYPES.find(t => t.id === type);
  return armorType ? armorType.name : type;
};

export const isValidSlot = (slot) => ARMOR_SLOTS.includes(slot);

export const isValidArmorType = (type) => ARMOR_TYPES.some(t => t.id === type);