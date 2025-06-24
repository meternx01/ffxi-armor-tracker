// src/hooks/useArmorData.js
import { useState, useEffect } from 'react';

// Define armor slots
export const armorSlots = ['Head', 'Body', 'Hands', 'Legs', 'Feet'];

// Define job list with IDs and names
export const jobList = [
  { id: 'Warrior', name: 'Warrior' },
  { id: 'Monk', name: 'Monk' },
  { id: 'White Mage', name: 'White Mage' },
  { id: 'Black Mage', name: 'Black Mage' },
  { id: 'Red Mage', name: 'Red Mage' },
  { id: 'Thief', name: 'Thief' },
  { id: 'Paladin', name: 'Paladin' },
  { id: 'Dark Knight', name: 'Dark Knight' },
  { id: 'Beastmaster', name: 'Beastmaster' },
  { id: 'Bard', name: 'Bard' },
  { id: 'Ranger', name: 'Ranger' },
  { id: 'Samurai', name: 'Samurai' },
  { id: 'Ninja', name: 'Ninja' },
  { id: 'Dragoon', name: 'Dragoon' },
  { id: 'Summoner', name: 'Summoner' },
  { id: 'Blue Mage', name: 'Blue Mage' },
  { id: 'Corsair', name: 'Corsair' },
  { id: 'Puppetmaster', name: 'Puppetmaster' },
  { id: 'Dancer', name: 'Dancer' },
  { id: 'Scholar', name: 'Scholar' },
  { id: 'Geomancer', name: 'Geomancer' },
  { id: 'Rune Fencer', name: 'Rune Fencer' }
];

export const useArmorData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [armorData, setArmorData] = useState({});
  const [debug, setDebug] = useState({});

  useEffect(() => {
    const loadArmorData = async () => {
      const debugInfo = {
        startTime: new Date().toISOString(),
        attempts: [],
        loadedFiles: {},
        processedData: {}
      };

      try {
        const armorTypes = ['Artifact', 'Relic', 'Empyrean'];
        const loadedData = {};
        let hasError = false;

        // Load all armor type data
        for (const type of armorTypes) {
          const attempt = { 
            type, 
            timestamp: new Date().toISOString(),
            fileUrl: `/data/${type}.json`
          };
          debugInfo.attempts.push(attempt);

          try {
            console.log(`Fetching ${type} data...`);
            const response = await fetch(`/data/${type}.json`);
            attempt.status = response.status;
            attempt.headers = Object.fromEntries(response.headers);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            attempt.contentLength = text.length;
            
            try {
              const data = JSON.parse(text);
              attempt.dataReceived = true;
              attempt.itemCount = Array.isArray(data) ? data.length : 0;
              debugInfo.loadedFiles[type] = { 
                itemCount: attempt.itemCount,
                firstItem: data[0] ? JSON.stringify(data[0]) : null
              };

              // Process items for this armor type
              if (Array.isArray(data)) {
                data.forEach((item, index) => {
                  try {
                    const job = item.Job;
                    const slot = item.Slot;
                    const name = item.Name;

                    // Enhanced validation
                    if (!job || !slot || !name) {
                      console.warn(`Invalid item data at index ${index}:`, {
                        item,
                        hasJob: !!job,
                        hasSlot: !!slot,
                        hasName: !!name
                      });
                      return;
                    }

                    // Ensure job exists in our list
                    if (!jobList.some(j => j.id === job)) {
                      console.warn(`Unknown job '${job}' at index ${index}`);
                      return;
                    }

                    // Ensure slot is valid
                    if (!armorSlots.includes(slot)) {
                      console.warn(`Unknown slot '${slot}' at index ${index}`);
                      return;
                    }

                    // Initialize data structures if needed
                    if (!loadedData[job]) loadedData[job] = {};
                    if (!loadedData[job][type]) loadedData[job][type] = {};

                    // Only process items that are tier 0 (base items)
                    if (item.Tier === 0) {
                      console.log(`Processing base item for ${job} ${type} ${slot}:`, {
                        name,
                        upgradeInfo: item.upgradePaths?.length || 0,
                      });

                      // Create the upgrade path array starting with the base item
                      const upgradePath = [];
                      
                      // Add all upgrade steps from the upgradePaths array
                      if (item.upgradePaths && Array.isArray(item.upgradePaths)) {
                        item.upgradePaths.forEach(upgrade => {
                          const requirements = upgrade.requirements
                            ?.map(req => `${req.quantity}x ${req.item}`)
                            .join(', ');
                          
                          const upgradeStep = {
                            name: upgrade.name,
                            requirements,
                            url: upgrade.URL || '',
                            iconUrl: upgrade.LinkURL || ''
                          };
                          
                          upgradePath.push(upgradeStep);
                        });
                      }

                      // Store the complete armor piece data
                      loadedData[job][type][slot] = {
                        Base: name,
                        URL: item.URL || '',
                        IconURL: item.LinkURL || '',
                        Tier: item.Tier,
                        UpgradePath: upgradePath
                      };

                      // Track processed data for debugging
                      if (!debugInfo.processedData[job]) {
                        debugInfo.processedData[job] = {};
                      }
                      if (!debugInfo.processedData[job][type]) {
                        debugInfo.processedData[job][type] = new Set();
                      }
                      debugInfo.processedData[job][type].add(slot);
                    }

                  } catch (itemError) {
                    console.error(`Error processing item at index ${index}:`, itemError);
                    attempt.itemErrors = attempt.itemErrors || [];
                    attempt.itemErrors.push({
                      index,
                      error: itemError.message,
                      item: JSON.stringify(item)
                    });
                  }
                });
              } else {
                throw new Error(`Data is not an array: ${typeof data}`);
              }

              attempt.success = true;
              attempt.processedJobs = Object.keys(loadedData).length;

            } catch (parseError) {
              throw new Error(`JSON parse error: ${parseError.message}`);
            }
          } catch (error) {
            hasError = true;
            console.error(`Error loading ${type} data:`, error);
            attempt.error = error.message;
          }
        }

        // Convert Sets to Arrays for JSON serialization
        Object.keys(debugInfo.processedData).forEach(job => {
          Object.keys(debugInfo.processedData[job]).forEach(type => {
            debugInfo.processedData[job][type] = 
              Array.from(debugInfo.processedData[job][type]);
          });
        });

        if (Object.keys(loadedData).length === 0) {
          throw new Error('No armor data was loaded successfully');
        }

        setArmorData(loadedData);
        setError(hasError ? 'Some data failed to load' : null);
      } catch (err) {
        console.error('Fatal error in loadArmorData:', err);
        debugInfo.fatalError = err.message;
        setError(err.message);
      } finally {
        setLoading(false);
        setDebug(debugInfo);
      }
    };

    loadArmorData();
  }, []);

  return {
    loading,
    error,
    armorData,
    debug
  };
};