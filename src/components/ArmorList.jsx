// src/components/ArmorList.jsx
import React, { useState, useEffect } from 'react';
import ArmorItem from './ArmorItem';
import { useArmor } from '../contexts/ArmorContext';

function ArmorList({ job, armorType }) {
  const [armorData, setArmorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentTiers, isUpgradeComplete, characters } = useArmor();

  useEffect(() => {
    const loadArmorData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Add timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        // Get base URL from import.meta.env.BASE_URL or default to '/'
        const base = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${base}data/${armorType}.json?t=${timestamp}`);
        if (!response.ok) {
          setError(`Failed to load ${armorType} data`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const filteredData = data
          .filter(item => item.Job === job)
          .sort((a, b) => {
            const slotOrder = {
              'Head': 1,
              'Body': 2,
              'Hands': 3,
              'Legs': 4,
              'Feet': 5
            };
            return slotOrder[a.Slot] - slotOrder[b.Slot];
          });

        if (filteredData.length === 0) {
          setError(`No ${armorType} armor found for ${job}`);
        }
        
        setArmorData(filteredData);
      } catch (err) {
        console.error('Error loading armor data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (job) {
      loadArmorData();
    }
  }, [job, armorType]);

  if (loading) return <div>Loading armor data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        No character selected. Please add a character to begin tracking armor progression.
      </div>
    );
  }

  // Group armor by slot
  const slots = ['Head', 'Body', 'Hands', 'Legs', 'Feet'];
  
  return (
    <div className="space-y-8">
      {slots.map(slot => {
        // Find the base item for this slot
        let item = armorData.find(armor => armor.Slot === slot);
        if (!item) return null;

        // Check if this item has been upgraded
        const currentTier = currentTiers[job]?.[armorType]?.[item.Name];
        if (currentTier) {
          // Find the upgraded item by checking all upgrade paths in the armor data
          // First try to find the exact current tier item
          const exactMatch = armorData.find(armor => 
            armor.Slot === slot && 
            armor.Job === job && 
            armor.Name === currentTier
          );

          if (exactMatch) {
            item = exactMatch;
          } else {
            // Look for an item that has this tier in its upgrade paths
            for (const armor of armorData) {
              if (armor.Slot === slot && armor.Job === job) {
                const upgradePath = armor.upgradePaths?.find(path => path.name === currentTier);
                if (upgradePath) {
                  item = { 
                    ...armor,
                    Name: upgradePath.name,
                    URL: upgradePath.URL,
                    LinkURL: upgradePath.LinkURL,
                    // Keep upgrade paths that haven't been completed
                    upgradePaths: armor.upgradePaths?.filter(p => !isUpgradeComplete(job, armorType, armor.Name, p.name)) || []
                  };
                  break;
                }
              }
            }
          }
        }

        return (
          <div key={slot} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <h2 className="text-lg font-semibold text-gray-800">{slot}</h2>
            </div>
            <ArmorItem 
              item={item}
              job={job}
              armorType={armorType}
            />
          </div>
        );
      })}
    </div>
  );
}

export default ArmorList;