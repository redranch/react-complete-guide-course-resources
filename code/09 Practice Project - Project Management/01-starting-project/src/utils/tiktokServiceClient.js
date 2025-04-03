/**
 * TikTok Service Client
 * 
 * This utility provides methods to interact with the Java TikTok service.
 * It handles API calls to resolve URLs, download videos, and process TikTok lists.
 */

// The base URL of the TikTok service
const SERVICE_BASE_URL = 'http://localhost:8080/api/tiktok';

/**
 * Check if the TikTok service is running
 * 
 * @returns {Promise<boolean>} True if the service is running
 */
export async function isServiceRunning() {
  try {
    const response = await fetch(`${SERVICE_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error checking TikTok service status:', error);
    return false;
  }
}

/**
 * Resolve a TikTok URL to extract metadata
 * 
 * @param {string} url The TikTok URL to resolve
 * @returns {Promise<Object>} The resolved TikTok item with metadata
 */
export async function resolveTikTokUrl(url) {
  try {
    const response = await fetch(`${SERVICE_BASE_URL}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to resolve TikTok URL');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error resolving TikTok URL:', error);
    throw error;
  }
}

/**
 * Download a TikTok video
 * 
 * @param {string} url The TikTok URL to download
 * @returns {Promise<Object>} Information about the downloaded video
 */
export async function downloadTikTokVideo(url) {
  try {
    const response = await fetch(`${SERVICE_BASE_URL}/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to download TikTok video');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    throw error;
  }
}

/**
 * Process a TikTok list from a text file
 * 
 * @param {File} file The text file containing TikTok entries
 * @returns {Promise<Object>} Information about the processed items
 */
export async function processTikTokList(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${SERVICE_BASE_URL}/process-list`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process TikTok list');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error processing TikTok list:', error);
    throw error;
  }
}

/**
 * Get the URL for a downloaded TikTok video
 * 
 * @param {string} filename The filename of the downloaded video
 * @returns {string} The URL to access the video
 */
export function getVideoUrl(filename) {
  return `${SERVICE_BASE_URL}/video/${filename}`;
}

/**
 * Check if the TikTok service is available and show a warning if it's not
 */
export function checkServiceAvailability() {
  isServiceRunning().then(isRunning => {
    if (!isRunning) {
      console.warn(
        'The TikTok service is not available. Some features like downloading videos ' +
        'and retrieving metadata will not work. Make sure the Java service is running on port 8080.'
      );
    } else {
      console.log('TikTok service is available');
    }
  });
} 