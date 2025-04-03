import React, { useState } from 'react';
import Button from '../ui/Button';
import TikTokItem from './TikTokItem';
import { getUncategorizedTikTokItems } from '../../utils/tiktokImport';

/**
 * TikTokList Component
 * 
 * Displays a list of TikTok favorites with options to:
 * - Filter the list
 * - View details for each item
 * - Categorize items
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of TikTok items to display
 * @param {Array} props.categories - Array of available categories
 * @param {Function} props.onCategorize - Handler for categorizing an item
 * @param {Function} props.onUpdateNotes - Handler for updating item notes
 * @param {boolean} props.showUncategorizedOnly - Whether to show only uncategorized items
 * @param {Object} props.playerSettings - Settings for video playback behavior
 * @param {Function} props.onCreateCategory - Handler for creating a new category
 */
function TikTokList({ 
  items, 
  categories, 
  onCategorize, 
  onUpdateNotes,
  showUncategorizedOnly = false,
  playerSettings = {
    autoPlayVideos: true,
    attemptsToUnmute: true,
    showSuggestions: true
  },
  onCreateCategory
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItemId, setExpandedItemId] = useState(null);
  
  // Filter items based on search term and uncategorized filter
  const displayedItems = items
    .filter(item => {
      // Apply uncategorized filter if enabled
      if (showUncategorizedOnly) {
        return !item.categoryId;
      }
      return true;
    })
    .filter(item => {
      // Apply search filter if there's a search term
      if (!searchTerm.trim()) return true;
      
      const term = searchTerm.toLowerCase();
      return (
        item.text.toLowerCase().includes(term) ||
        item.url.toLowerCase().includes(term) ||
        item.date.toLowerCase().includes(term) ||
        item.notes.toLowerCase().includes(term)
      );
    });
    
  // Toggle item expansion for details view
  const toggleItemExpansion = (itemId) => {
    setExpandedItemId(expandedItemId === itemId ? null : itemId);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            TikTok Favorites ({displayedItems.length})
          </h2>
          
          {/* Filter toggle for uncategorized */}
          {!showUncategorizedOnly && (
            <div className="text-gray-400 text-sm">
              {getUncategorizedTikTokItems(items).length} items uncategorized
            </div>
          )}
        </div>
        
        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by date, URL or notes..."
            className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Items list */}
      {displayedItems.length === 0 ? (
        <p className="text-gray-400 italic p-4 bg-gray-900 rounded">
          {searchTerm ? 'No matching items found.' : 'No TikTok favorites found.'}
        </p>
      ) : (
        <ul className="space-y-4">
          {displayedItems.map(item => (
            <TikTokItem
              key={item.id}
              item={item}
              categories={categories}
              isExpanded={item.id === expandedItemId}
              onToggleExpand={() => toggleItemExpansion(item.id)}
              onCategorize={onCategorize}
              onUpdateNotes={onUpdateNotes}
              playerSettings={playerSettings}
              showSuggestions={playerSettings.showSuggestions}
              onCreateCategory={onCreateCategory}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export default TikTokList; 