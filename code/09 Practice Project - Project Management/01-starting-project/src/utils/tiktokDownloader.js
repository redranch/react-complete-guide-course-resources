/**
 * TikTok Download Utility
 * 
 * IMPORTANT: This is for local experimental use only!
 * Using this in a production app would violate TikTok's terms of service.
 * This utility should only be used for personal experimentation and learning.
 */

/**
 * Attempts to download a TikTok video using various methods
 * 
 * @param {string} tiktokUrl - The URL of the TikTok video
 * @param {string} videoId - The ID of the TikTok video
 * @returns {Promise<boolean>} - Whether the download was successful
 */
export async function downloadTikTokVideo(tiktokUrl, videoId) {
  // Try multiple methods in sequence until one works
  try {
    // Method 1: Direct download if we already have the video element (most likely to fail)
    const success = await tryDirectVideoDownload(tiktokUrl, videoId);
    if (success) return true;
    
    // Method 2: Use TikTok API to get the video URL (requires CORS proxy)
    const success2 = await tryApiDownload(tiktokUrl, videoId);
    if (success2) return true;
    
    // Method 3: Fallback to suggesting tools or extensions
    suggestAlternativeDownloadMethods(tiktokUrl);
    return false;
  } catch (error) {
    console.error('Error downloading TikTok video:', error);
    suggestAlternativeDownloadMethods(tiktokUrl);
    return false;
  }
}

/**
 * Tries to download a video directly from a video element
 * 
 * @param {string} tiktokUrl - The TikTok URL
 * @param {string} videoId - The video ID
 * @returns {Promise<boolean>} - Whether download was successful
 */
async function tryDirectVideoDownload(tiktokUrl, videoId) {
  try {
    // Find the video element in TikTok iframes
    const iframes = Array.from(document.querySelectorAll('iframe'));
    let videoElement = null;
    
    for (const iframe of iframes) {
      try {
        // Check if this iframe is for the target TikTok
        if (iframe.getAttribute('data-tiktok-id') === videoId) {
          const doc = iframe.contentWindow?.document;
          videoElement = doc?.querySelector('video');
          if (videoElement) break;
        }
      } catch (e) {
        // Skip iframes we can't access due to CORS
        continue;
      }
    }
    
    if (!videoElement) {
      console.log('No video element found for direct download');
      return false;
    }
    
    // Get video source URL
    const videoSrc = videoElement.src || videoElement.querySelector('source')?.src;
    if (!videoSrc) {
      console.log('No video source found');
      return false;
    }
    
    // Create a download link
    const a = document.createElement('a');
    a.href = videoSrc;
    a.download = `tiktok-${videoId || 'video'}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Error in direct video download:', error);
    return false;
  }
}

/**
 * Tries to download the TikTok video using their API
 * 
 * @param {string} tiktokUrl - The TikTok URL
 * @param {string} videoId - The video ID
 * @returns {Promise<boolean>} - Whether download was successful
 */
async function tryApiDownload(tiktokUrl, videoId) {
  try {
    // This is a sample CORS proxy - replace with your own if needed
    // Note: This approach still has CORS issues in most cases
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/'
    ];
    
    // Try each proxy
    for (const proxy of corsProxies) {
      try {
        // Fetch the TikTok page to extract video info
        const response = await fetch(`${proxy}${encodeURIComponent(tiktokUrl)}`);
        const html = await response.text();
        
        // Extract video URL from page (this pattern may change over time)
        const videoUrlMatch = html.match(/"playAddr":"([^"]+)"/);
        if (!videoUrlMatch || !videoUrlMatch[1]) continue;
        
        let videoUrl = videoUrlMatch[1].replace(/\\u002F/g, '/');
        
        // Create download link
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `tiktok-${videoId || 'video'}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        return true;
      } catch (e) {
        // Try next proxy
        console.log(`Proxy ${proxy} failed:`, e);
        continue;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error in API download:', error);
    return false;
  }
}

/**
 * Opens an intermediate page with alternative download methods
 * 
 * @param {string} tiktokUrl - The TikTok URL
 */
function suggestAlternativeDownloadMethods(tiktokUrl) {
  // Create a modal to suggest alternatives
  const modalContainer = document.createElement('div');
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100%';
  modalContainer.style.height = '100%';
  modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modalContainer.style.zIndex = '9999';
  modalContainer.style.display = 'flex';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';
  
  const modal = document.createElement('div');
  modal.style.backgroundColor = '#222';
  modal.style.borderRadius = '8px';
  modal.style.padding = '20px';
  modal.style.maxWidth = '500px';
  modal.style.color = 'white';
  modal.style.fontFamily = 'sans-serif';
  
  modal.innerHTML = `
    <h3 style="margin-top: 0; color: white;">Download TikTok Video</h3>
    <p>Direct download failed due to browser security restrictions.</p>
    <p>Try these alternatives:</p>
    <ul style="margin-bottom: 20px;">
      <li style="margin-bottom: 8px;">Use a browser extension like "Video DownloadHelper"</li>
      <li style="margin-bottom: 8px;">Use an online TikTok downloader service</li>
      <li style="margin-bottom: 8px;">Visit the original TikTok page and use developer tools</li>
    </ul>
    <div style="display: flex; justify-content: space-between;">
      <button id="openTikTok" style="background: #ff0050; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Open TikTok</button>
      <button id="closeModal" style="background: #333; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  modalContainer.appendChild(modal);
  document.body.appendChild(modalContainer);
  
  // Add event listeners
  document.getElementById('openTikTok').addEventListener('click', () => {
    window.open(tiktokUrl, '_blank');
    document.body.removeChild(modalContainer);
  });
  
  document.getElementById('closeModal').addEventListener('click', () => {
    document.body.removeChild(modalContainer);
  });
}

/**
 * Extract the video ID from a TikTok URL
 * 
 * @param {string} url - The TikTok URL
 * @returns {string|null} - The video ID or null if not found
 */
export function extractTikTokVideoId(url) {
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
} 