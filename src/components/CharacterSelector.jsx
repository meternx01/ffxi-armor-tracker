import React, { useState } from 'react';
import { useArmor } from '../contexts/ArmorContext';

export default function CharacterSelector() {
  const {
    characters,
    selectedCharacterId,
    addCharacter,
    removeCharacter,
    renameCharacter,
    selectCharacter
  } = useArmor();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addCharacter(newName.trim());
      setNewName('');
    }
  };

  const handleRename = (id) => {
    if (editName.trim()) {
      renameCharacter(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  if (!characters || characters.length === 0) {
    return (
      <div className="character-selector p-2 border-b bg-gray-50">
        <div className="mb-2 text-center text-gray-600">No characters found. Please add a character to begin tracking armor progression.</div>
        <div className="flex items-center gap-2 mb-2 justify-center">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Add character..."
            className="border px-2 py-1 rounded"
          />
          <button onClick={handleAdd} className="bg-blue-500 text-white px-2 py-1 rounded">Add</button>
        </div>
      </div>
    );
  }

  return (
    <div className="character-selector p-2 border-b bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Add character..."
          className="border px-2 py-1 rounded"
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-2 py-1 rounded">Add</button>
      </div>
      <ul className="space-y-1">
        {characters.map(char => (
          <li key={char.id} className="flex items-center gap-2">
            {editingId === char.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="border px-2 py-1 rounded"
                />
                <button onClick={() => handleRename(char.id)} className="bg-green-500 text-white px-2 py-1 rounded">Save</button>
                <button onClick={() => setEditingId(null)} className="bg-gray-300 px-2 py-1 rounded">Cancel</button>
              </>
            ) : (
              <>
                <button
                  onClick={() => selectCharacter(char.id)}
                  className={`px-2 py-1 rounded ${selectedCharacterId === char.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  {char.name}
                </button>
                <button onClick={() => { setEditingId(char.id); setEditName(char.name); }} className="text-xs text-gray-500">Rename</button>
                <button onClick={() => removeCharacter(char.id)} className="text-xs text-red-500">Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
