// src/components/ArmorDisplay.jsx
import React, { useEffect } from 'react';
import { useArmor } from '../contexts/ArmorContext';
import { armorSlots } from '../hooks/useArmorData';
import ArmorPieceCard from './ArmorPieceCard';

function ArmorDisplay() {
  const {
    selectedJob,
    selectedType,
    getArmorForJobAndType,
    debug,
    loading,
    error
  } = useArmor();

  const armorSet = getArmorForJobAndType();
  
  useEffect(() => {
    console.log('ArmorDisplay Data Flow:', {
      selectedJob,
      selectedType,
      armorSet,
      availableSlots: armorSet ? Object.keys(armorSet) : [],
      debug,
      timestamp: new Date().toISOString()
    });
  }, [selectedJob, selectedType, armorSet, debug]);

  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3">Loading...</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3 text-red-500">Error Loading Data</h2>
        <div className="text-gray-500">{error}</div>
        <div className="mt-4 p-4 bg-gray-100 rounded text-left">
          <h3 className="font-bold">Debug Information:</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (!selectedJob || !selectedType) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3 text-gray-400">Armor Pieces</h2>
        <div className="text-gray-500">
          {!selectedJob 
            ? "Please select a job first"
            : "Please select an armor type"}
        </div>
      </div>
    );
  }

  if (!armorSet) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-3 text-red-500">No Data Available</h2>
        <div className="text-gray-500">
          No armor data found for {selectedJob} {selectedType} set
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded text-left">
          <h3 className="font-bold">Debug Information:</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify({
              selectedJob,
              selectedType,
              debug,
              timestamp: new Date().toISOString()
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-3">
        {selectedJob} {selectedType} Set
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {armorSlots.map((slot) => (
          <ArmorPieceCard 
            key={slot} 
            slot={slot} 
            data={armorSet[slot]}
            jobId={selectedJob}
            armorType={selectedType}
          />
        ))}
      </div>
    </div>
  );
}

export default ArmorDisplay;