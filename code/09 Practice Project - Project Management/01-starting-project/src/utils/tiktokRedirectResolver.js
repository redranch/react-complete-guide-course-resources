/**
 * Utility for resolving TikTok share URLs to their final redirect destinations
 * 
 * TikTok share URLs (like tiktokv.com/share/video/1234567890) redirect to full URLs
 * that contain useful information like the creator's username (e.g., @username).
 * This utility resolves those redirects in the background to get better data for categorization.
 */

// Queue of items waiting to be processed
let redirectQueue = [];
// Flag to track if the worker is running
let isWorkerRunning = false;
// Store for tracking processed items
const redirectStatusMap = new Map();
// Store for tracking retry attempts
const retryAttemptsMap = new Map();
// Maximum number of retry attempts
const MAX_RETRY_ATTEMPTS = 3;
// Available CORS proxies to try (in order of preference)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/'  // Requires an activation visit for free usage
];

/**
 * Queue TikTok items for redirect resolution
 * 
 * @param {Array} items - TikTok items to process for redirect resolution
 */
export function queueItemsForRedirectResolution(items) {
  // Filter to only include items not already in queue or processed
  const newItems = items.filter(item => {
    // Don't queue items that already have a redirectUrl
    if (item.redirectUrl) return false;
    
    // Get number of retry attempts
    const attempts = retryAttemptsMap.get(item.id) || 0;
    
    // Check if item is in queue
    const inQueue = redirectQueue.some(queuedItem => queuedItem.id === item.id);
    
    // Check if item has a resolved status with error and max attempts
    const status = redirectStatusMap.get(item.id);
    const hasFailedMax = status && status.isResolved && status.error && attempts >= MAX_RETRY_ATTEMPTS;
    
    // Queue if not in queue and hasn't failed max attempts
    return !inQueue && !hasFailedMax;
  });
  
  if (newItems.length > 0) {
    redirectQueue = [...redirectQueue, ...newItems];
    console.log(`Added ${newItems.length} TikTok URLs to redirect resolution queue`);
    
    // Start the worker if not already running
    if (!isWorkerRunning) {
      startRedirectResolutionWorker();
    }
  }
}

/**
 * Start the background worker to process the queue
 */
function startRedirectResolutionWorker() {
  if (isWorkerRunning || redirectQueue.length === 0) return;
  
  isWorkerRunning = true;
  console.log('Starting TikTok redirect resolution worker');
  
  // Process one item from the queue every second
  const workerId = setInterval(() => {
    if (redirectQueue.length === 0) {
      clearInterval(workerId);
      isWorkerRunning = false;
      console.log('Redirect resolution worker finished, queue empty');
      return;
    }
    
    const item = redirectQueue.shift();
    resolveRedirectUrl(item);
  }, 1000); // 1-second delay to avoid overwhelming the browser
}

/**
 * Try to resolve a redirect URL using multiple CORS proxies
 * 
 * @param {string} url - The URL to resolve
 * @returns {Promise<string|null>} - The resolved URL or null if failed
 */
async function tryMultipleCorsProxies(url) {
  let lastError = null;
  
  // Try each proxy in sequence until one works
  for (const proxyUrl of CORS_PROXIES) {
    try {
      console.log(`Trying CORS proxy: ${proxyUrl}`);
      
      // Create a controller to allow aborting the fetch after a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      // First try a HEAD request (lighter)
      try {
        const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`, {
          method: 'HEAD', 
          redirect: 'manual', // Don't auto-follow redirects
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Check for redirect location in headers
        if (response.status >= 300 && response.status < 400) {
          const redirectUrl = response.headers.get('location');
          if (redirectUrl) {
            console.log(`Successfully got redirect from ${proxyUrl} using HEAD`);
            return redirectUrl;
          }
        }
      } catch (headError) {
        console.log(`HEAD request failed with ${proxyUrl}:`, headError);
        // Continue to GET request
      }
      
      // If HEAD didn't work, try GET (will follow redirects)
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 10000);
      
      const getResponse = await fetch(`${proxyUrl}${encodeURIComponent(url)}`, {
        redirect: 'follow', // This time follow redirects
        signal: getController.signal
      });
      
      clearTimeout(getTimeoutId);
      
      // The final URL after redirects
      let finalUrl = getResponse.url;
      
      // Remove the CORS proxy prefix if present
      if (finalUrl.startsWith(proxyUrl)) {
        finalUrl = finalUrl.substring(proxyUrl.length);
        
        // If URL is encoded, decode it
        if (finalUrl.startsWith('http%3A%2F%2F') || finalUrl.startsWith('https%3A%2F%2F')) {
          finalUrl = decodeURIComponent(finalUrl);
        }
      }
      
      // If we got a different URL than the original, it's a redirect
      if (finalUrl && finalUrl !== url && !finalUrl.includes('corsproxy.io')) {
        console.log(`Successfully got redirect from ${proxyUrl} using GET`);
        return finalUrl;
      }
      
      // If we got here, this proxy didn't give us a redirect - try next one
    } catch (error) {
      console.warn(`Error with CORS proxy ${proxyUrl}:`, error);
      lastError = error;
      // Continue to next proxy
    }
  }
  
  // If we tried all proxies and none worked, throw the last error
  if (lastError) {
    throw new Error(`All CORS proxies failed: ${lastError.message}`);
  }
  
  return null;
}

/**
 * Resolve the final URL for a TikTok share link
 * 
 * @param {Object} item - TikTok item to process
 */
async function resolveRedirectUrl(item) {
  // Track retry attempts
  const attempts = retryAttemptsMap.get(item.id) || 0;
  retryAttemptsMap.set(item.id, attempts + 1);
  
  try {
    console.log(`Resolving redirect for TikTok URL: ${item.url} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS})`);
    
    // Update status to processing
    redirectStatusMap.set(item.id, {
      isProcessing: true,
      isResolved: false,
      startTime: Date.now(),
      attempts: attempts + 1
    });
    
    // Try to resolve using multiple CORS proxies
    const redirectUrl = await tryMultipleCorsProxies(item.url);
    
    // Update status with the result
    redirectStatusMap.set(item.id, {
      isProcessing: false,
      isResolved: true,
      redirectUrl: redirectUrl,
      resolvedAt: Date.now(),
      attempts: attempts + 1
    });
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('tiktok-redirect-resolved', {
      detail: { 
        itemId: item.id, 
        redirectUrl: redirectUrl 
      }
    }));
    
    console.log(`Resolved redirect for TikTok URL ${item.id}:`, redirectUrl || 'No redirect found');
    
    return redirectUrl;
  } catch (error) {
    console.error(`Error resolving redirect for TikTok URL ${item.url}:`, error);
    
    // Update status with the error
    redirectStatusMap.set(item.id, {
      isProcessing: false,
      isResolved: true,
      error: error.message,
      resolvedAt: Date.now(),
      attempts: attempts + 1
    });
    
    // Dispatch event to notify components of failure
    window.dispatchEvent(new CustomEvent('tiktok-redirect-resolved', {
      detail: { 
        itemId: item.id, 
        error: error.message 
      }
    }));
    
    // If we haven't reached max attempts, requeue for retry after a delay
    if (attempts < MAX_RETRY_ATTEMPTS) {
      console.log(`Will retry TikTok URL ${item.id} after delay (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS})`);
      setTimeout(() => {
        redirectQueue.push(item);
        if (!isWorkerRunning) {
          startRedirectResolutionWorker();
        }
      }, 5000 * Math.pow(2, attempts)); // Exponential backoff: 5s, 10s, 20s
    }
    
    return null;
  }
}

/**
 * Get the current status of redirect resolution for a TikTok item
 * 
 * @param {string} itemId - ID of the TikTok item
 * @returns {Object|null} - Status object or null if not in process
 */
export function getRedirectResolutionStatus(itemId) {
  // Check if in the status map
  if (redirectStatusMap.has(itemId)) {
    const status = redirectStatusMap.get(itemId);
    return {
      ...status,
      attempts: retryAttemptsMap.get(itemId) || 0
    };
  }
  
  // Check if in the queue
  const queueIndex = redirectQueue.findIndex(item => item.id === itemId);
  if (queueIndex !== -1) {
    return {
      isProcessing: false,
      isResolved: false,
      inQueue: true,
      queuePosition: queueIndex + 1,
      attempts: retryAttemptsMap.get(itemId) || 0
    };
  }
  
  return null;
}

/**
 * Clear the redirect resolution status and retry attempts for an item
 * to allow retrying from scratch
 * 
 * @param {string} itemId - ID of the TikTok item
 */
export function clearRedirectResolutionStatus(itemId) {
  redirectStatusMap.delete(itemId);
  retryAttemptsMap.delete(itemId);
} 