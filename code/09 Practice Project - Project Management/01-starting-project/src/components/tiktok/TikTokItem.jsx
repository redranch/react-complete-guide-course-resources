import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import { suggestCategory } from '../../utils/categorySuggestions';
import { updateTikTokItemRedirectUrl, updateTikTokItemNotes } from '../../utils/tiktokImport';
import { 
  queueItemsForRedirectResolution, 
  getRedirectResolutionStatus,
  clearRedirectResolutionStatus
} from '../../utils/tiktokRedirectResolver';
import { 
  analyzeVideoWhenPlayed, 
  getVideoAnalysisStatus,
  forceAnalysis
} from '../../utils/videoTextExtractor';
import CategorySuggestions from './CategorySuggestions';
import { downloadTikTokVideo, isServiceRunning } from '../../utils/tiktokServiceClient';

// Add this constant near the top of the file, after the imports
const MAX_RETRY_ATTEMPTS = 3; // Maximum number of retry attempts (should match tiktokRedirectResolver.js)

/**
 * TikTokItem Component
 * 
 * Displays a single TikTok favorite with:
 * - Date and URL
 * - Embedded video player
 * - Categorization options
 * - Notes editing
 * - Expandable/collapsible view
 * 
 * @param {Object} props
 * @param {Object} props.item - The TikTok item object
 * @param {Array} props.categories - Available categories
 * @param {boolean} props.isExpanded - Whether the item details are expanded
 * @param {Function} props.onToggleExpand - Handler for toggling expansion
 * @param {Function} props.onCategorize - Handler for categorizing the item
 * @param {Function} props.onUpdateNotes - Handler for updating notes
 * @param {Object} props.playerSettings - Settings for video playback behavior
 * @param {boolean} props.showSuggestions - Whether to show category suggestions
 * @param {Function} props.onCreateCategory - Handler for creating a new category
 */
function TikTokItem({
  item,
  categories,
  isExpanded,
  onToggleExpand,
  onCategorize,
  onUpdateNotes,
  playerSettings = {
    autoPlayVideos: true,
    attemptsToUnmute: true,
    showSuggestions: true
  },
  showSuggestions = true,
  onCreateCategory
}) {
  // State variables
  const [selectedCategoryId, setSelectedCategoryId] = useState(item.categoryId || '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(item.subcategoryId || '');
  const [selectedNestedSubcategoryId, setSelectedNestedSubcategoryId] = useState(item.nestedSubcategoryId || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes || '');
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [showEmbeddedVideo, setShowEmbeddedVideo] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoWidth, setVideoWidth] = useState('100%');
  const [redirectStatus, setRedirectStatus] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  
  // Refs
  const iframeRef = useRef(null);
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  
  // Find the selected category and subcategory objects
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedSubcategory = selectedCategory?.subcategories?.find(
    sub => sub.id === selectedSubcategoryId
  );
  
  // Fetch suggestions when item changes or after redirect resolution
  useEffect(() => {
    if (!showSuggestions || item.categoryId) return;
    
    // Get suggestion based on item data
    // We don't pass videoAnalysis since we know it's not reliable due to security restrictions
    const suggestion = suggestCategory(item, categories);
    
    if (suggestion) {
      setSuggestedCategory(suggestion);
    }
  }, [item, categories, showSuggestions]);

  // Monitor redirect resolution
  useEffect(() => {
    // Only process uncategorized items
    if (!item.categoryId) {
      // Queue for redirect resolution if not already processed
      if (!item.redirectUrl) {
        queueItemsForRedirectResolution([item]);
      }
      
      // Setup status update listener
      const handleRedirectResolved = (e) => {
        if (e.detail.itemId === item.id) {
          // Update the status
          setRedirectStatus({
            isResolved: true,
            redirectUrl: e.detail.redirectUrl,
            error: e.detail.error
          });
          
          // Only update the item if we actually got a redirect URL
          if (e.detail.redirectUrl) {
            // Update the item in the parent component
            onUpdateNotes(item.id, item.notes, e.detail.redirectUrl);
          }
        }
      };
      
      // Add event listener
      window.addEventListener('tiktok-redirect-resolved', handleRedirectResolved);
      
      // Get current status
      const status = getRedirectResolutionStatus(item.id);
      setRedirectStatus(status);
      
      // Clean up
      return () => {
        window.removeEventListener('tiktok-redirect-resolved', handleRedirectResolved);
      };
    }
  }, [item.id, item.categoryId, item.redirectUrl]);

  // Update the useEffect for category suggestions with the latest data
  useEffect(() => {
    // Only suggest if item is uncategorized and suggestions are enabled
    if (!item.categoryId && showSuggestions) {
      // Suggest based on current data (URLs)
      const suggestion = suggestCategory(item, categories);
      setSuggestedCategory(suggestion);
    } else {
      setSuggestedCategory(null);
    }
  }, [item, categories, showSuggestions, item.redirectUrl]);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId('');
    setSelectedNestedSubcategoryId('');
  };
  
  // Handle subcategory selection
  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value;
    setSelectedSubcategoryId(subcategoryId);
    setSelectedNestedSubcategoryId('');
  };
  
  // Handle nested subcategory selection
  const handleNestedSubcategoryChange = (e) => {
    setSelectedNestedSubcategoryId(e.target.value);
  };
  
  // Apply the suggested category
  const handleApplySuggestion = async (e) => {
    e.stopPropagation();
    if (!suggestedCategory) return;
    
    // If it's a new category suggestion, we need to create it first
    if (suggestedCategory.isNewCategory && onCreateCategory) {
      try {
        // Create new category
        const newCategory = {
          title: suggestedCategory.categoryName,
          description: suggestedCategory.categoryDescription,
          dueDate: new Date().toISOString().split('T')[0], // today
          subcategories: []
        };
        
        // Call the create category function and wait for the result
        const createdCategory = await onCreateCategory(newCategory);
        
        if (createdCategory && createdCategory.id) {
          // Successfully created new category, now select it
          setSelectedCategoryId(createdCategory.id);
          
          // Reset subcategory selections
          setSelectedSubcategoryId('');
          setSelectedNestedSubcategoryId('');
          
          // Apply the categorization
          onCategorize(
            item.id,
            createdCategory.id,
            null,
            null
          );
          
          // Clear the suggestion after applying
          setSuggestedCategory(null);
        }
      } catch (error) {
        console.error('Error creating new category:', error);
      }
    } else {
      // For existing categories, just apply as before
      setSelectedCategoryId(suggestedCategory.categoryId);
      
      // Reset subcategory selections
      setSelectedSubcategoryId('');
      setSelectedNestedSubcategoryId('');
      
      // Apply the categorization
      onCategorize(
        item.id,
        suggestedCategory.categoryId,
        null,
        null
      );
      
      // Clear the suggestion after applying
      setSuggestedCategory(null);
    }
  };
  
  // Save categorization
  const handleSaveCategorization = () => {
    onCategorize(
      item.id,
      selectedCategoryId || null,
      selectedSubcategoryId || null,
      selectedNestedSubcategoryId || null
    );
    // Clear suggestion after a manual categorization
    setSuggestedCategory(null);
  };
  
  // Save notes
  const handleSaveNotes = () => {
    onUpdateNotes(item.id, notes);
    setIsEditingNotes(false);
  };
  
  // Format the assigned category text
  const getCategoryDisplay = () => {
    if (!item.categoryId) return 'Uncategorized';
    
    const category = categories.find(cat => cat.id === item.categoryId);
    if (!category) return 'Unknown Category';
    
    let display = category.title;
    
    if (item.subcategoryId) {
      const subcategory = category.subcategories?.find(sub => sub.id === item.subcategoryId);
      if (subcategory) {
        display += ` > ${subcategory.name}`;
        
        if (item.nestedSubcategoryId && subcategory.subcategories) {
          const nestedSubcategory = subcategory.subcategories?.find(
            nested => nested.id === item.nestedSubcategoryId
          );
          if (nestedSubcategory) {
            display += ` > ${nestedSubcategory.name}`;
          }
        }
      }
    }
    
    return display;
  };

  // Extract video ID from TikTok URL
  const getVideoId = (url) => {
    try {
      // Handle various TikTok URL formats
      const patterns = [
        /tiktok\.com\/.*\/video\/(\d+)/i,
        /tiktokv\.com\/.*\/video\/(\d+)/i,
        /tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
        /tiktokv\.com\/share\/video\/(\d+)/i,
        /vm\.tiktok\.com\/(\w+)/i,
        /\d+$/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // If no pattern matched but URL ends with digits, use that as fallback
      const digitsMatch = url.match(/(\d+)$/);
      if (digitsMatch) {
        return digitsMatch[1];
      }
      
      return null;
    } catch (error) {
      console.error("Error extracting TikTok video ID:", error);
      return null;
    }
  };
  
  // Generate TikTok embed URL
  const getEmbedUrl = () => {
    const videoId = getVideoId(item.url);
    if (!videoId) return null;
    
    // Add autoplay and unmute parameters based on settings
    let url = `https://www.tiktok.com/embed/v2/${videoId}?`;
    
    if (playerSettings.autoPlayVideos) {
      url += 'autoplay=1&';
    }
    
    if (playerSettings.attemptsToUnmute) {
      url += 'muted=0&';
    }
    
    url += 'controls=1';
    return url;
  };
  
  // Update video width based on parent container
  useEffect(() => {
    if (isExpanded && showEmbeddedVideo) {
      const updateWidth = () => {
        const parentWidth = document.getElementById(`tiktok-embed-container-${item.id}`)?.offsetWidth;
        if (parentWidth) {
          // Set width proportional to container, keeping aspect ratio
          setVideoWidth(Math.min(parentWidth - 20, 340)); // TikTok's default width is 340px
        }
      };
      
      updateWidth();
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [isExpanded, showEmbeddedVideo, item.id]);

  // Try to start playing the video after it loads
  useEffect(() => {
    if (isVideoLoaded && iframeRef.current && playerSettings.autoPlayVideos) {
      try {
        const iframe = iframeRef.current;
        
        // Method 1: Click the play button programmatically
        setTimeout(() => {
          try {
            // Try to find and click play button
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            const playButton = iframeDoc.querySelector('button[aria-label="Play"], .video-play-button, .tiktok-play-button');
            if (playButton) {
              playButton.click();
            }
          } catch (e) {
            console.log('Could not access iframe content to click play button', e);
          }
        }, 500);
        
        // Method 2: Try to send a message to the iframe to play and unmute
        setTimeout(() => {
          try {
            const iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
              // Try multiple message formats that TikTok might understand
              iframeWindow.postMessage({ command: 'play' }, '*');
              
              if (playerSettings.attemptsToUnmute) {
                iframeWindow.postMessage({ command: 'unmute' }, '*');
              }
              
              iframeWindow.postMessage({ event: 'command', func: 'playVideo' }, '*');
              iframeWindow.postMessage({ method: 'play' }, '*');
              
              // Also try the standard HTML5 video API
              iframeWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'playVideo',
                args: []
              }), '*');
            }
          } catch (e) {
            console.log('Could not send play command to iframe', e);
          }
        }, 800);
        
        // Method 3: Reload iframe if video doesn't start playing
        if (playerSettings.autoPlayVideos) {
          setTimeout(() => {
            if (iframe && iframe.contentWindow) {
              // Check if video is playing (this is approximate)
              try {
                const currentSrc = iframe.src;
                if (!currentSrc.includes('autoplay=1')) {
                  iframe.src = `${currentSrc}&autoplay=1${playerSettings.attemptsToUnmute ? '&muted=0' : ''}`;
                }
              } catch (e) {
                console.log('Could not refresh iframe', e);
              }
            }
          }, 1500);
        }
      } catch (error) {
        console.log('Error trying to auto-play TikTok video:', error);
      }
    }
  }, [isVideoLoaded, playerSettings.autoPlayVideos, playerSettings.attemptsToUnmute]);

  // Handle the unmute button click
  const handleUnmuteClick = (e) => {
    e.stopPropagation();
    
    if (iframeRef.current) {
      try {
        // Reload the iframe with autoplay and unmuted
        const iframe = iframeRef.current;
        const currentSrc = iframe.src;
        
        // Add autoplay and unmuted parameters if they don't exist
        const newSrc = currentSrc.includes('?') 
          ? `${currentSrc}&autoplay=1&muted=0` 
          : `${currentSrc}?autoplay=1&muted=0`;
          
        iframe.src = newSrc;
        
        // Also try to click the play and unmute buttons in the iframe
        setTimeout(() => {
          try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            
            // Try to find and click the unmute button
            const muteButton = iframeDoc.querySelector('[aria-label="Unmute"], .sound-button');
            if (muteButton) {
              muteButton.click();
            }
            
            // Also try to click the play button if video isn't playing
            const playButton = iframeDoc.querySelector('[aria-label="Play"], .video-play-button');
            if (playButton) {
              playButton.click();
            }
          } catch (e) {
            console.log('Could not access iframe content to control video', e);
          }
        }, 500);
      } catch (error) {
        console.log('Error trying to control TikTok video:', error);
      }
    }
  };

  const embedUrl = getEmbedUrl();
  
  // Effect to track video analysis status
  useEffect(() => {
    const handleAnalysisUpdate = (event) => {
      if (event.detail.itemId === item.id) {
        setAnalysisStatus(event.detail.status);
      }
    };
    
    window.addEventListener('tiktok-video-analysis-update', handleAnalysisUpdate);
    
    return () => {
      window.removeEventListener('tiktok-video-analysis-update', handleAnalysisUpdate);
    };
  }, [item.id]);

  // Initiate video analysis for this TikTok
  const initiateVideoAnalysis = () => {
    // If we have a video element directly, use it
    if (videoRef.current) {
      console.log('Analyzing video with video element');
      analyzeVideoWhenPlayed(videoRef.current, item.id);
    } else {
      // Otherwise force analysis without a video element
      console.log('Forcing analysis without video element');
      forceAnalysis(item.id);
    }
  };

  // Function to handle toggling the entire item's expansion
  const handleToggleVideo = (e) => {
    // Don't toggle if click was on a button or dropdown
    if (
      e.target.tagName === 'BUTTON' || 
      e.target.tagName === 'SELECT' || 
      e.target.closest('button') || 
      e.target.closest('select')
    ) {
      return;
    }
    
    // Simply call the parent's toggle function
    onToggleExpand();
  };

  // Effect to automatically show video when expanded
  useEffect(() => {
    if (isExpanded) {
      setShowEmbeddedVideo(true);
      // Use setTimeout to ensure video analysis starts after video is rendered
      setTimeout(() => {
        initiateVideoAnalysis();
      }, 500);
    } else {
      setShowEmbeddedVideo(false);
    }
  }, [isExpanded]);

  // Update the video rendering to include the ref
  const renderEmbeddedVideo = () => {
    const embedUrl = getEmbedUrl();
    if (!embedUrl) return null;
    
    return (
      <div className="mt-3 relative" ref={videoContainerRef}>
        {/* Simple video container with responsive aspect ratio */}
        <div className="w-full flex justify-center py-2">
          {/* TikTok video container with clean styling */}
          <div 
            className="relative w-full max-w-[340px] rounded-lg bg-black overflow-hidden"
            style={{ aspectRatio: '9/16' }}
          >
            {/* Wrapper that hides the white panels on TikTok embed */}
            <div className="absolute inset-0 overflow-hidden">
              <iframe 
                ref={iframeRef}
                src={embedUrl}
                className="absolute h-full w-[calc(100%+80px)]"
                style={{ 
                  border: 'none',
                  background: '#000',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
                allow="autoplay; encrypted-media" 
                allowFullScreen
                title={`TikTok video ${item.id}`}
                data-tiktok-id={item.id}
                onLoad={(e) => {
                  setIsVideoLoaded(true);
                  
                  // Try to find the video element inside the iframe
                  const iframe = e.target;
                  try {
                    // Wait a moment for the iframe content to fully load
                    setTimeout(() => {
                      try {
                        const iframeDoc = iframe.contentWindow?.document;
                        const videoElement = iframeDoc?.querySelector('video');
                        
                        if (videoElement) {
                          console.log('Found video element in iframe');
                          videoRef.current = videoElement;
                          initiateVideoAnalysis();
                          
                          if (playerSettings.attemptsToUnmute) {
                            attemptToUnmuteVideo(videoElement);
                          }
                        } else {
                          console.log('Video element not found in iframe');
                        }
                      } catch (e) {
                        console.log('Could not access iframe content:', e);
                      }
                    }, 500);
                  } catch (e) {
                    console.log('Could not find video in iframe:', e);
                  }
                }}
              />
            </div>
            
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mb-2"></div>
                  <div className="text-white text-sm">Loading video...</div>
                </div>
              </div>
            )}
            
            {/* Video controls */}
            <div className="absolute bottom-2 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent z-10">
              <div className="flex items-center gap-2">
                {/* Mute button - may not work due to cross-origin restrictions */}
                <button 
                  className="bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white opacity-80 hover:opacity-100 transition-opacity"
                  onClick={handleUnmuteClick}
                  title="Unmute video (may not work due to browser restrictions)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </button>
                
                {/* Server-side download button */}
                <button 
                  className="bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white opacity-80 hover:opacity-100 transition-opacity"
                  onClick={handleServerDownload}
                  title="Download via server (requires Java service)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                
                {/* Link to original video */}
                <button 
                  className="bg-gray-800 bg-opacity-70 rounded-full p-1.5 text-white opacity-80 hover:opacity-100 transition-opacity ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(item.url, '_blank');
                  }}
                  title="Open original TikTok video"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Attempt to unmute the video (may not work due to browser security policies)
  const attemptToUnmuteVideo = (videoElement) => {
    if (!videoElement) return;
    
    try {
      // Try different methods to unmute the video
      videoElement.muted = false;
      
      // Try to set volume if it's at 0
      if (videoElement.volume === 0) {
        videoElement.volume = 1.0;
      }
      
      // Try to play if not already playing
      if (videoElement.paused) {
        videoElement.play().catch(e => {
          console.log('Auto-play prevented by browser policy:', e);
        });
      }
    } catch (error) {
      console.error('Error attempting to unmute video:', error);
    }
  };

  // Add a new handler for server-side download
  const handleServerDownload = async (e) => {
    e.stopPropagation();
    
    // Check if service is running
    const serviceAvailable = await isServiceRunning();
    if (!serviceAvailable) {
      alert('The TikTok service is not available. Make sure the Java service is running on port 8080.');
      return;
    }
    
    // Show loading indicator
    const button = e.currentTarget;
    const originalContent = button.innerHTML;
    button.innerHTML = `
      <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
    
    try {
      // Call the Java service to download the video
      const result = await downloadTikTokVideo(item.url);
      
      // Restore button
      button.innerHTML = originalContent;
      
      // Open the video in a new tab
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      } else {
        alert('Video was downloaded on the server but no URL was provided.');
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      alert(`Error downloading video: ${error.message}`);
      
      // Restore button
      button.innerHTML = originalContent;
    }
  };

  return (
    <li className="bg-gray-900 rounded-lg shadow-md overflow-hidden">
      {/* Item Header - Always visible */}
      <div 
        className="px-4 py-3 cursor-pointer flex justify-between items-center"
        onClick={handleToggleVideo}
      >
        <div>
          <div className="text-white font-medium">{item.date}</div>
          <div className="text-gray-400 text-sm truncate">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-blue-400 hover:text-blue-300 underline"
              onClick={(e) => e.stopPropagation()}
            >
              {item.url}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`bg-black hover:bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            onClick={onToggleExpand}
            aria-label={isExpanded ? 'Collapse item' : 'Expand item'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Video Display */}
          {renderEmbeddedVideo()}
          
          {/* Notes Box */}
          <div className="mt-3">
            <label className="text-white text-sm mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="2"
              placeholder="Add notes about this TikTok..."
            />
            <div className="mt-2 flex justify-end">
              <Button
                variant="secondary"
                onClick={handleSaveNotes}
                size="small"
              >
                Save Notes
              </Button>
            </div>
          </div>
          
          {/* Category Selection */}
          <div className="mt-4">
            <h4 className="text-white font-medium mb-2">Save To Category</h4>
            
            {/* Video Analysis Debug Panel */}
            {debugMode && (
              <div className="mb-4 p-3 bg-gray-800 rounded-md border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="text-sm font-medium text-white">Video Analysis</h5>
                  
                  <button 
                    onClick={initiateVideoAnalysis}
                    className={`text-xs px-2 py-1 rounded ${
                      analysisStatus && analysisStatus.isProcessing 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-red-900 text-white hover:bg-red-800'
                    }`}
                    disabled={analysisStatus && analysisStatus.isProcessing}
                  >
                    {analysisStatus && analysisStatus.isProcessing 
                      ? 'Analyzing...' 
                      : 'Analyze Video Text'}
                  </button>
                </div>
                
                {/* Analysis Status */}
                <div className="text-xs text-gray-300 mb-2">
                  Status: {!analysisStatus ? 'Not yet processed' : 
                     analysisStatus.isProcessing ? 'Processing...' : 
                     analysisStatus.error ? <span className="text-red-400">Error: {analysisStatus.error}</span> : 
                     'Complete'}
                  
                  {analysisStatus && analysisStatus.securityRestricted && (
                    <span className="ml-2 text-yellow-500">(Simulated due to cross-origin restrictions)</span>
                  )}
                </div>
                
                {analysisStatus && (analysisStatus.progress || analysisStatus.progress === 0) && (
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-red-600 h-1.5 rounded-full" 
                      style={{width: `${analysisStatus.progress}%`}}
                    ></div>
                  </div>
                )}
                
                {analysisStatus && !analysisStatus.isProcessing && analysisStatus.startTime && analysisStatus.endTime && (
                  <div className="text-xs text-gray-400 mb-2">
                    Analysis took {((analysisStatus.endTime - analysisStatus.startTime) / 1000).toFixed(2)}s
                    {analysisStatus.securityRestricted && " (simulated)"}
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-400">
                  <p className="mb-1">How it works: The video analysis tool attempts to extract text from TikTok videos to suggest categories. 
                  <br/>Note: Browser security restrictions may limit actual video access.</p>
                </div>
              </div>
            )}
            
            {/* Category Suggestions */}
            {showSuggestions && (
              <CategorySuggestions 
                item={item} 
                categories={categories}
                onApplySuggestion={handleApplySuggestion}
                onCreateCategory={onCreateCategory}
              />
            )}
            
            <div className="grid grid-cols-1 gap-2 mt-3">
              {/* Category dropdown */}
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.title}</option>
                  ))}
                </select>
              </div>
              
              {/* Subcategory dropdown (conditional) */}
              {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Subcategory</label>
                  <select
                    value={selectedSubcategoryId}
                    onChange={handleSubcategoryChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a subcategory</option>
                    {selectedCategory.subcategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Nested subcategory dropdown (conditional) */}
              {selectedSubcategory && selectedSubcategory.subcategories && selectedSubcategory.subcategories.length > 0 && (
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Nested Subcategory</label>
                  <select
                    value={selectedNestedSubcategoryId}
                    onChange={handleNestedSubcategoryChange}
                    className="w-full p-2 bg-gray-800 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Select a nested subcategory</option>
                    {selectedSubcategory.subcategories.map(nested => (
                      <option key={nested.id} value={nested.id}>{nested.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Show current categorization */}
            {item.categoryId && (
              <div className="mt-3 p-2 bg-gray-800 rounded text-sm">
                {getCategoryDisplay()}
              </div>
            )}
            
            <div className="mt-3 flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveCategorization}
                disabled={!selectedCategoryId}
                size="small"
              >
                Save Categorization
              </Button>
            </div>
          </div>
          
          {/* Debug Info Toggle */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="text-xs text-gray-400 hover:text-white"
            >
              {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default TikTokItem; 