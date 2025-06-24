// src/components/JobSelector.jsx
import React from 'react';
import { useArmor } from '../contexts/ArmorContext';

const JOBS = [
  { id: 'Warrior', name: 'WAR' },
  { id: 'Monk', name: 'MNK' },
  { id: 'White Mage', name: 'WHM' },
  { id: 'Black Mage', name: 'BLM' },
  { id: 'Red Mage', name: 'RDM' },
  { id: 'Thief', name: 'THF' },
  { id: 'Paladin', name: 'PLD' },
  { id: 'Dark Knight', name: 'DRK' },
  { id: 'Beastmaster', name: 'BST' },
  { id: 'Bard', name: 'BRD' },
  { id: 'Ranger', name: 'RNG' },
  { id: 'Samurai', name: 'SAM' },
  { id: 'Ninja', name: 'NIN' },
  { id: 'Dragoon', name: 'DRG' },
  { id: 'Summoner', name: 'SMN' },
  { id: 'Blue Mage', name: 'BLU' },
  { id: 'Corsair', name: 'COR' },
  { id: 'Puppetmaster', name: 'PUP' },
  { id: 'Dancer', name: 'DNC' },
  { id: 'Scholar', name: 'SCH' },
  { id: 'Geomancer', name: 'GEO' },
  { id: 'Rune Fencer', name: 'RUN' }
];

function JobSelector() {
  const { 
    selectedJob, 
    setSelectedJob, 
    setSelectedType,
    debug 
  } = useArmor();

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Job
      </label>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-11">
        {JOBS.map((job) => (
          <button
            key={job.id}
            onClick={() => {
              setSelectedJob(job.id);
              setSelectedType(null);
              console.log('Selected job:', job.id);
            }}
            className={`
              px-3 py-2 text-sm rounded-md transition-colors duration-200
              ${selectedJob === job.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }
            `}
          >
            {job.name}
          </button>
        ))}
      </div>
      {debug?.selectedJob && (
        <div className="mt-2 text-xs text-gray-500">
          Selected Job ID: {debug.selectedJob}
        </div>
      )}
    </div>
  );
}

export default JobSelector;