// src/App.jsx
import React, { useState, useEffect } from 'react';
import ArmorList from './components/ArmorList';
import { ArmorProvider } from './contexts/ArmorContext';

function App() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [selectedType, setSelectedType] = useState('Artifact');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        // Load all armor data files
        const responses = await Promise.all([
          fetch('/data/Artifact.json'),
          fetch('/data/Relic.json'),
          fetch('/data/Empyrean.json')
        ]);

        // Check if any response failed
        responses.forEach((response, index) => {
          if (!response.ok) {
            const types = ['Artifact', 'Relic', 'Empyrean'];
            throw new Error(`Failed to load ${types[index]} armor data`);
          }
        });

        // Parse all JSON responses
        const [artifactData, relicData, empyreanData] = await Promise.all(
          responses.map(response => response.json())
        );

        // Combine all jobs from different armor types and remove duplicates
        const allJobs = new Set([
          ...artifactData.map(item => item.Job),
          ...relicData.map(item => item.Job),
          ...empyreanData.map(item => item.Job)
        ]);

        // Sort jobs alphabetically
        const uniqueJobs = [...allJobs].sort();
        setJobs(uniqueJobs);
        setSelectedJob(uniqueJobs[0]); // Set first job as default
        setLoading(false);
      } catch (err) {
        console.error('Error loading armor data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const mainContent = (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold text-center">FFXI Armor Upgrade Guide</h1>
      </header>
      
      <main className="container mx-auto p-4">
        <div className="flex gap-4 mb-6">
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="p-2 border rounded"
          >
            {jobs.map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="Artifact">Artifact</option>
            <option value="Relic">Relic</option>
            <option value="Empyrean">Empyrean</option>
          </select>
        </div>

        <ArmorList
          job={selectedJob}
          armorType={selectedType}
        />
      </main>
    </div>
  );

  return (
    <ArmorProvider>
      {loading ? (
        <div className="text-center p-8">Loading...</div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">Error: {error}</div>
      ) : (
        mainContent
      )}
    </ArmorProvider>
  );
}

export default App;