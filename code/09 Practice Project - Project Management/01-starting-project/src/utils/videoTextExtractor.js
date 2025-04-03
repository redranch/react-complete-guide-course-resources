/**
 * Video Text Extractor Utility
 * 
 * This utility attempts to extract text from TikTok videos but is limited by browser security restrictions.
 * Due to cross-origin restrictions, browsers block access to video frame data from domains other than your own.
 */

// Track video analysis status for each TikTok item
const videoAnalysisStatus = new Map();

/**
 * Extract text from a video element by capturing frames
 * Due to cross-origin restrictions, this will likely fail with TikTok videos.
 * 
 * @param {HTMLVideoElement|null} videoElement - Video element to analyze
 * @param {string} tiktokId - ID of the TikTok item being analyzed
 * @returns {Promise} - Promise that resolves when analysis is complete
 */
export function extractTextFromVideo(videoElement, tiktokId) {
  // Update status to processing
  videoAnalysisStatus.set(tiktokId, {
    isProcessing: true,
    progress: 0,
    startTime: Date.now(),
    creator: null,
    keywords: [],
    error: null
  });

  return new Promise((resolve) => {
    // Check if we can actually use the video element
    const canUseVideoElement = videoElement && 
                               videoElement instanceof HTMLVideoElement &&
                               videoElement.videoWidth > 0;
    
    if (canUseVideoElement) {
      // Try real analysis with video element
      try {
        if (videoElement.readyState >= 2) {
          startVideoAnalysis(videoElement, tiktokId, resolve);
        } else {
          videoElement.addEventListener('loadeddata', () => {
            startVideoAnalysis(videoElement, tiktokId, resolve);
          }, { once: true });
        }
      } catch (error) {
        console.error('Error during video analysis setup:', error);
        reportSecurityRestriction(tiktokId, 'Failed to set up video analysis due to security restrictions', resolve);
      }
    } else {
      console.log('Video element not usable');
      reportSecurityRestriction(tiktokId, 'No usable video available for analysis', resolve);
    }
  });
}

/**
 * Start analyzing video frames to extract text
 */
function startVideoAnalysis(videoElement, tiktokId, resolvePromise) {
  try {
    // Setup canvas for frame capture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      updateAnalysisStatus(tiktokId, {
        isProcessing: false, 
        error: 'Canvas 2D context not supported'
      });
      
      resolvePromise({
        success: false,
        error: 'Canvas 2D context not supported'
      });
      return;
    }
    
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Try to draw a frame to the canvas
    try {
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Try to read pixel data - this will fail with cross-origin videos
      try {
        ctx.getImageData(0, 0, 1, 1);
        
        // If we get here, we can actually access the video frames!
        performRealAnalysis(videoElement, canvas, ctx, tiktokId, resolvePromise);
      } catch (securityError) {
        console.error('Security error accessing video data:', securityError);
        reportSecurityRestriction(tiktokId, 'Cannot access video frame data due to cross-origin restrictions', resolvePromise);
      }
    } catch (drawError) {
      console.error('Error drawing video to canvas:', drawError);
      reportSecurityRestriction(tiktokId, 'Cannot draw video to canvas due to security restrictions', resolvePromise);
    }
  } catch (error) {
    console.error('Failed to set up video analysis:', error);
    reportSecurityRestriction(tiktokId, 'Error setting up video analysis', resolvePromise);
  }
}

/**
 * Report that we can't analyze due to security restrictions
 */
function reportSecurityRestriction(tiktokId, errorMessage, resolvePromise) {
  updateAnalysisStatus(tiktokId, {
    isProcessing: false,
    error: errorMessage,
    securityRestricted: true,
    endTime: Date.now()
  });
  
  resolvePromise({
    success: false,
    error: errorMessage,
    securityRestricted: true
  });
}

/**
 * Perform actual frame analysis if we can access the video data
 * This would only work for same-origin videos or in specific browser extensions
 */
function performRealAnalysis(videoElement, canvas, ctx, tiktokId, resolvePromise) {
  console.log('Successfully accessed video data! Performing real analysis');
  
  // Capture frames at different points in the video
  const capturePoints = [0.1, 0.3, 0.5, 0.7, 0.9];
  let captureIndex = 0;
  let extractedText = [];
  
  function processNextFrame() {
    if (captureIndex >= capturePoints.length) {
      // Analysis complete
      const result = {
        success: true,
        extractedText,
        securityRestricted: false
      };
      
      updateAnalysisStatus(tiktokId, {
        isProcessing: false,
        progress: 100,
        endTime: Date.now(),
        extractedText,
        securityRestricted: false
      });
      
      resolvePromise(result);
      return;
    }
    
    // Update progress
    updateAnalysisStatus(tiktokId, {
      progress: Math.round((captureIndex / capturePoints.length) * 100)
    });
    
    try {
      // Seek to the next capture point
      videoElement.currentTime = capturePoints[captureIndex] * (videoElement.duration || 10);
      captureIndex++;
      
      videoElement.addEventListener('seeked', () => {
        try {
          // Draw the current frame to canvas
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          
          // In a real implementation, we'd use OCR here to extract text
          // For demonstration, we'll just note that we captured a frame
          extractedText.push(`Frame ${captureIndex} captured at ${Math.round(videoElement.currentTime)}s`);
          
          // Continue to next frame
          processNextFrame();
        } catch (e) {
          console.error('Error capturing frame:', e);
          processNextFrame(); // Continue to next frame anyway
        }
      }, { once: true });
    } catch (error) {
      console.error('Error seeking in video:', error);
      captureIndex++;
      processNextFrame(); // Try next frame
    }
  }
  
  // Start processing frames
  processNextFrame();
}

/**
 * Update the analysis status for a TikTok item
 * 
 * @param {string} tiktokId - ID of the TikTok item
 * @param {Object} updateData - Data to update in the status
 */
function updateAnalysisStatus(tiktokId, updateData) {
  const currentStatus = videoAnalysisStatus.get(tiktokId) || {};
  videoAnalysisStatus.set(tiktokId, {
    ...currentStatus,
    ...updateData
  });
  
  // Dispatch an event to notify components of status updates
  window.dispatchEvent(new CustomEvent('tiktok-video-analysis-update', {
    detail: { 
      itemId: tiktokId,
      status: videoAnalysisStatus.get(tiktokId)
    }
  }));
}

/**
 * Get the current status of video analysis for a TikTok item
 * 
 * @param {string} tiktokId - ID of the TikTok item
 * @returns {Object|null} - Analysis status or null if not analyzed
 */
export function getVideoAnalysisStatus(tiktokId) {
  return videoAnalysisStatus.get(tiktokId) || null;
}

/**
 * Start video analysis when a video is played
 * 
 * @param {HTMLVideoElement|null} videoElement - Video element that is playing
 * @param {string} tiktokId - ID of the TikTok item
 */
export function analyzeVideoWhenPlayed(videoElement, tiktokId) {
  // Check if already analyzed
  const status = getVideoAnalysisStatus(tiktokId);
  if (status && (!status.error || status.isProcessing)) {
    return; // Already analyzed or in progress
  }
  
  // Check if video element is usable
  if (videoElement && videoElement instanceof HTMLVideoElement) {
    // Listen for play event to start analysis
    const handlePlay = () => {
      extractTextFromVideo(videoElement, tiktokId)
        .then(result => {
          console.log(`Video analysis complete for TikTok ${tiktokId}:`, result);
        })
        .catch(error => {
          console.error(`Video analysis failed for TikTok ${tiktokId}:`, error);
          reportSecurityRestriction(tiktokId, 'Analysis failed due to an error', () => {});
        });
      
      // Remove the listener to avoid multiple analyses
      videoElement.removeEventListener('play', handlePlay);
    };
    
    // Start analysis immediately if video is already playing
    if (!videoElement.paused) {
      handlePlay();
    } else {
      videoElement.addEventListener('play', handlePlay);
    }
  } else {
    // No usable video element
    console.log('No video element available for', tiktokId);
    reportSecurityRestriction(tiktokId, 'No video element available for analysis', () => {});
  }
}

/**
 * Force an immediate analysis of a TikTok item
 * 
 * @param {string} tiktokId - ID of the TikTok item 
 * @returns {Promise} - Promise that resolves when analysis is complete
 */
export function forceAnalysis(tiktokId) {
  // If already in progress, return the existing promise
  const status = getVideoAnalysisStatus(tiktokId);
  if (status && status.isProcessing) {
    return new Promise(resolve => {
      const checkStatus = () => {
        const currentStatus = getVideoAnalysisStatus(tiktokId);
        if (currentStatus && !currentStatus.isProcessing) {
          resolve(currentStatus);
        } else {
          setTimeout(checkStatus, 100);
        }
      };
      checkStatus();
    });
  }
  
  // Try to find the video element on the page for this TikTok
  const videoElement = document.querySelector(`video[data-tiktok-id="${tiktokId}"]`);
  return extractTextFromVideo(videoElement, tiktokId);
} 