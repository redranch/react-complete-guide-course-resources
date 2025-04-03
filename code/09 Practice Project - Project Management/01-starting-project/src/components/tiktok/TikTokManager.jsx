import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import TikTokList from './TikTokList';
import TikTokImporter from './TikTokImporter';
import { loadTikTokItems, saveTikTokItems, categorizeTikTokItem, updateTikTokItemNotes } from '../../utils/tiktokImport';
import { checkServiceAvailability } from '../../utils/tiktokServiceClient';

/**
 * TikTokManager Component
 * 
 * Main component for managing TikTok favorites, including:
 * - Importing TikTok lists
 * - Viewing and filtering the list
 * - Categorizing items
 * - Adding notes to items
 * - Settings for video playback
 * - Creating new categories from suggestions
 * 
 * @param {Object} props
 * @param {Array} props.categories - Available categories for classification
 * @param {Function} props.onCreateCategory - Handler for creating a new category
 */
function TikTokManager({ categories, onCreateCategory }) {
  const [items, setItems] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [showUncategorizedOnly, setShowUncategorizedOnly] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoPlayVideos: true,
    attemptsToUnmute: true,
    showSuggestions: true
  });
  
  // Load saved TikTok items and settings on mount
  useEffect(() => {
    // Load saved TikTok items
    const savedItems = loadTikTokItems();
    setItems(savedItems);
    
    // Load saved settings
    try {
      const savedSettings = localStorage.getItem('tiktok_player_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading TikTok player settings:', error);
    }
  }, []);
  
  // Save items whenever they change
  useEffect(() => {
    if (items.length > 0) {
      saveTikTokItems(items);
    }
  }, [items]);
  
  // Save settings whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('tiktok_player_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving TikTok player settings:', error);
    }
  }, [settings]);
  
  // Check if the Java service is available
  useEffect(() => {
    checkServiceAvailability();
  }, []);
  
  // Handle TikTok import
  const handleImport = (newItems) => {
    // Merge with existing items, avoiding duplicates by URL
    const existingUrls = new Set(items.map(item => item.url));
    const uniqueNewItems = newItems.filter(item => !existingUrls.has(item.url));
    
    setItems(prevItems => [...prevItems, ...uniqueNewItems]);
    setIsImporting(false);
  };
  
  // Handle item categorization
  const handleCategorize = (itemId, categoryId, subcategoryId, nestedSubcategoryId) => {
    const updatedItems = categorizeTikTokItem(
      itemId, 
      categoryId, 
      subcategoryId, 
      nestedSubcategoryId, 
      items
    );
    
    setItems(updatedItems);
  };
  
  // Handle updating notes
  const handleUpdateNotes = (itemId, notes) => {
    const updatedItems = updateTikTokItemNotes(itemId, notes, items);
    setItems(updatedItems);
  };
  
  // Handle clearing all items
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all TikTok favorites? This cannot be undone.')) {
      setItems([]);
      saveTikTokItems([]);
    }
  };
  
  // Handle settings changes
  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Handle creating a new category from suggestions
  const handleCreateCategory = async (categoryData) => {
    if (!onCreateCategory) {
      console.error('Missing onCreateCategory handler');
      return null;
    }
    
    try {
      // Call the parent component's create category handler
      const newCategory = await onCreateCategory(categoryData);
      return newCategory;
    } catch (error) {
      console.error('Error creating new category:', error);
      return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {isImporting ? (
        <TikTokImporter 
          onImport={handleImport} 
          onCancel={() => setIsImporting(false)} 
        />
      ) : (
        <>
          {/* Header with actions */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">TikTok Favorites</h1>
            <div className="flex gap-3">
              <Button 
                variant="secondary"
                onClick={() => setShowSettings(!showSettings)}
              >
                Settings
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setShowUncategorizedOnly(!showUncategorizedOnly)}
              >
                {showUncategorizedOnly ? 'Show All' : 'Show Uncategorized'}
              </Button>
              <Button 
                variant="primary"
                onClick={() => setIsImporting(true)}
              >
                Import TikTok List
              </Button>
              {items.length > 0 && (
                <Button 
                  variant="secondary"
                  onClick={handleClearAll}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <h2 className="text-xl font-medium text-white mb-4">Video Playback Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">
                    Auto-play videos when expanded
                    <div className="text-gray-500 text-xs">
                      Videos will start playing as soon as you click "Show Video"
                    </div>
                  </label>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.autoPlayVideos}
                        onChange={(e) => handleSettingChange('autoPlayVideos', e.target.checked)}
                      />
                      <div className={`w-11 h-6 rounded-full peer 
                        ${settings.autoPlayVideos ? 'bg-red-800' : 'bg-gray-700'} 
                        peer-focus:ring-2 peer-focus:ring-red-300 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:rounded-full after:h-5 after:w-5 
                        after:transition-all peer-checked:after:translate-x-full`}></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">
                    Attempt to unmute videos
                    <div className="text-gray-500 text-xs">
                      TikTok videos are muted by default, this tries to unmute them automatically
                    </div>
                  </label>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.attemptsToUnmute}
                        onChange={(e) => handleSettingChange('attemptsToUnmute', e.target.checked)}
                      />
                      <div className={`w-11 h-6 rounded-full peer 
                        ${settings.attemptsToUnmute ? 'bg-red-800' : 'bg-gray-700'} 
                        peer-focus:ring-2 peer-focus:ring-red-300 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:rounded-full after:h-5 after:w-5 
                        after:transition-all peer-checked:after:translate-x-full`}></div>
                    </label>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-gray-300">
                    Show category suggestions
                    <div className="text-gray-500 text-xs">
                      Suggest categories based on TikTok URL content
                    </div>
                  </label>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.showSuggestions}
                        onChange={(e) => handleSettingChange('showSuggestions', e.target.checked)}
                      />
                      <div className={`w-11 h-6 rounded-full peer 
                        ${settings.showSuggestions ? 'bg-red-800' : 'bg-gray-700'} 
                        peer-focus:ring-2 peer-focus:ring-red-300 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                        after:bg-white after:rounded-full after:h-5 after:w-5 
                        after:transition-all peer-checked:after:translate-x-full`}></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-gray-400 text-sm border-t border-gray-800 pt-3">
                <p>Note: Due to browser security policies, some autoplay and unmuting features may not work in all browsers. 
                These settings attempt to provide the best experience possible within these limitations.</p>
              </div>
            </div>
          )}
          
          {/* TikTok List */}
          <TikTokList 
            items={items}
            categories={categories}
            onCategorize={handleCategorize}
            onUpdateNotes={handleUpdateNotes}
            showUncategorizedOnly={showUncategorizedOnly}
            playerSettings={settings}
            onCreateCategory={handleCreateCategory}
          />
        </>
      )}
    </div>
  );
}

export default TikTokManager; 