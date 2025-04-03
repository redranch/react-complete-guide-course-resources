/**
 * Utility functions for suggesting categories based on TikTok content
 */

/**
 * Keywords associated with common content categories
 * Each category has an array of keywords that might indicate it's a good match
 */
const CATEGORY_KEYWORDS = {
  music: [
    'guitar', 'piano', 'drum', 'singing', 'song', 'concert', 'band', 'singer',
    'musician', 'rock', 'pop', 'jazz', 'rap', 'hip hop', 'violin', 'cover',
    'play', 'performance', 'record', 'dance', 'instrument', 'bass', 'chord', 'beat'
  ],
  cooking: [
    'recipe', 'cook', 'food', 'baking', 'kitchen', 'meal', 'chef', 'delicious', 
    'restaurant', 'dish', 'cuisine', 'tasty', 'eating', 'dinner', 'lunch', 'breakfast',
    'ingredients', 'homemade', 'healthy', 'dessert', 'snack', 'plate'
  ],
  fitness: [
    'workout', 'exercise', 'gym', 'fit', 'training', 'muscle', 'cardio', 'weight',
    'strength', 'running', 'yoga', 'health', 'body', 'routine', 'fitness', 'sport',
    'athletic', 'physical', 'cycle', 'stretch', 'lift', 'train'
  ],
  travel: [
    'travel', 'trip', 'adventure', 'vacation', 'destination', 'tour', 'journey',
    'explore', 'tourism', 'country', 'city', 'beach', 'mountain', 'hotel', 
    'flight', 'abroad', 'foreign', 'culture', 'sightseeing', 'visit'
  ],
  gaming: [
    'game', 'gaming', 'play', 'player', 'console', 'xbox', 'playstation', 'nintendo',
    'pc', 'stream', 'twitch', 'fortnite', 'minecraft', 'level', 'fps', 'rpg',
    'strategy', 'esports', 'competitive', 'controller', 'online', 'multiplayer'
  ],
  fashion: [
    'fashion', 'style', 'clothing', 'outfit', 'dress', 'wear', 'trend', 'design',
    'model', 'look', 'accessory', 'shoes', 'bag', 'makeup', 'beauty', 'hair',
    'cosmetics', 'stylish', 'apparel', 'brand', 'shopping'
  ],
  education: [
    'learn', 'education', 'school', 'teach', 'student', 'knowledge', 'study',
    'lesson', 'university', 'college', 'academic', 'science', 'math', 'history',
    'facts', 'information', 'tutorial', 'how to', 'guide', 'explanation'
  ],
  comedy: [
    'funny', 'humor', 'joke', 'laugh', 'comedy', 'prank', 'hilarious', 'meme',
    'parody', 'skit', 'stand up', 'comic', 'satirical', 'entertaining', 'gag'
  ],
  pets: [
    'pet', 'dog', 'cat', 'animal', 'puppy', 'kitten', 'cute', 'fur', 'paw',
    'bark', 'meow', 'bird', 'fish', 'rabbit', 'hamster', 'reptile', 'vet',
    'adoption', 'rescue', 'breed', 'walk'
  ],
  technology: [
    'tech', 'technology', 'gadget', 'computer', 'phone', 'mobile', 'app',
    'software', 'hardware', 'programming', 'code', 'developer', 'digital',
    'startup', 'innovation', 'ai', 'artificial intelligence', 'machine learning',
    'internet', 'device', 'smart'
  ],
  art: [
    'art', 'drawing', 'painting', 'sketch', 'artist', 'creative', 'design', 'illustration',
    'canvas', 'gallery', 'sculpture', 'craft', 'masterpiece', 'exhibition', 'color',
    'brush', 'artistic', 'create', 'photography', 'photo', 'picture'
  ],
  diy: [
    'diy', 'craft', 'handmade', 'make', 'build', 'project', 'homemade', 'creation',
    'tutorial', 'how to', 'woodwork', 'knitting', 'sewing', 'crochet', 'renovation',
    'restore', 'upcycle', 'decorate', 'tools', 'workshop'
  ],
  dance: [
    'dance', 'choreography', 'moves', 'dancer', 'routine', 'tiktok dance', 'trending',
    'challenge', 'ballet', 'hip hop', 'rhythm', 'steps', 'performance', 'viral'
  ],
  beauty: [
    'makeup', 'skincare', 'beauty', 'cosmetics', 'hair', 'tutorial', 'skin', 'products',
    'routine', 'tips', 'nails', 'lipstick', 'eyeshadow', 'foundation', 'hairstyle', 'salon'
  ],
  motivation: [
    'motivation', 'inspiration', 'success', 'goals', 'mindset', 'self-improvement',
    'growth', 'discipline', 'achievement', 'positive', 'empowerment', 'advice'
  ]
};

/**
 * Category descriptions for creating new categories
 */
const CATEGORY_DESCRIPTIONS = {
  music: "Music videos, performances, instruments, and songs",
  cooking: "Food recipes, cooking tutorials, and culinary content",
  fitness: "Workouts, exercises, gym routines, and health-related content",
  travel: "Destinations, trips, adventures, and tourism content",
  gaming: "Video games, gameplay, esports, and gaming-related content",
  fashion: "Clothing, outfits, style tips, and fashion trends",
  education: "Learning materials, tutorials, and educational content",
  comedy: "Humorous videos, jokes, pranks, and entertaining content",
  pets: "Animals, pet care, cute animal videos, and pet-related content",
  technology: "Tech reviews, gadgets, software, and technology news",
  art: "Artwork, drawings, paintings, and creative content",
  diy: "Do-it-yourself projects, crafts, and creative making",
  dance: "Dance routines, choreography, and dance challenges",
  beauty: "Makeup tutorials, skincare routines, and beauty products",
  motivation: "Inspirational content, advice, and personal development"
};

/**
 * Tries to extract meaning from a TikTok URL and video ID
 * 
 * @param {string} url - TikTok video URL
 * @param {string|null} redirectUrl - Resolved redirect URL (if available)
 * @returns {object} - Extracted information and keywords
 */
function extractInfoFromUrls(url, redirectUrl = null) {
  const info = {
    keywords: [],
    username: null,
    videoId: null,
    extractedFrom: 'share url',
    extractionDetails: []
  };
  
  // First try to extract from the redirect URL if available
  if (redirectUrl) {
    info.extractedFrom = 'redirect url';
    info.extractionDetails.push(`Analyzing redirect URL: ${redirectUrl}`);
    
    // Extract username
    const usernameMatch = redirectUrl.match(/@([a-zA-Z0-9_.]+)/);
    if (usernameMatch && usernameMatch[1]) {
      const username = usernameMatch[1];
      info.username = username;
      info.extractionDetails.push(`Found username: ${username}`);
      
      // Break username into parts and add as keywords
      const usernameParts = username.split(/[_.]/).filter(part => part.length > 2);
      info.keywords.push(...usernameParts);
      if (usernameParts.length > 0) {
        info.extractionDetails.push(`Extracted username parts: ${usernameParts.join(', ')}`);
      }
    }
    
    // Extract video ID
    const videoIdMatch = redirectUrl.match(/video\/(\d+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      info.videoId = videoIdMatch[1];
      info.extractionDetails.push(`Found video ID: ${info.videoId}`);
    }
    
    // Extract other meaningful parts from the URL
    const urlParts = redirectUrl.split(/[\/\?#&]/);
    for (const part of urlParts) {
      // Skip parts that are too short, numeric-only, or common URL components
      if (part.length > 3 && 
          !/^\d+$/.test(part) && 
          !part.includes('.com') &&
          !part.includes('www.') &&
          !part.includes('tiktok') &&
          !part.includes('http') &&
          part !== 'video' &&
          part !== 'share') {
        // Skip username (already processed)
        if (part.startsWith('@')) continue;
        
        info.keywords.push(part);
        info.extractionDetails.push(`Added URL part as keyword: ${part}`);
      }
    }
  }
  
  // If no redirect URL or we didn't extract much, fall back to the original URL
  if (!redirectUrl || info.keywords.length < 2) {
    // If we already used redirect URL, add this note
    if (redirectUrl) {
      info.extractionDetails.push('Not enough information from redirect URL, analyzing original URL as well');
    }
    
    // Extract video ID from original URL if we don't have it yet
    if (!info.videoId) {
      const videoIdMatch = url.match(/video\/(\d+)/);
      if (videoIdMatch && videoIdMatch[1]) {
        info.videoId = videoIdMatch[1];
        info.extractionDetails.push(`Found video ID from original URL: ${info.videoId}`);
      }
    }
    
    // Look for descriptive parts in the original URL
    const urlParts = url.split(/[\/\?#&]/);
    for (const part of urlParts) {
      // Skip parts that are too short, numeric-only, or common URL components
      if (part.length > 3 && 
          !/^\d+$/.test(part) && 
          !part.includes('.com') &&
          !part.includes('www.') &&
          !part.includes('tiktok') &&
          !part.includes('http') &&
          part !== 'video' &&
          part !== 'share') {
        info.keywords.push(part);
        info.extractionDetails.push(`Added original URL part as keyword: ${part}`);
      }
    }
  }
  
  return info;
}

/**
 * Extract keywords from creator username and video content
 * 
 * @param {string} creator - Creator username (with @ symbol)
 * @param {Array<string>} contentKeywords - Keywords extracted from video content
 * @returns {Array<string>} - Combined and processed keywords
 */
function processVideoAnalysisResults(creator, contentKeywords = []) {
  const keywords = [...contentKeywords];
  
  // Process creator name if available
  if (creator) {
    // Remove @ symbol and split by non-alphanumeric characters
    const creatorName = creator.replace('@', '').toLowerCase();
    
    // Add creator name variations as keywords
    keywords.push(creatorName);
    
    // Split by camelCase, underscores, dots or numbers
    const creatorParts = creatorName.split(/(?=[A-Z])|[_.\d]+/);
    creatorParts.forEach(part => {
      if (part && part.length > 2) {
        keywords.push(part.toLowerCase());
      }
    });
  }
  
  return keywords.filter(k => k && k.length > 2);
}

/**
 * Incorporate video analysis results into the category suggestion process
 * 
 * @param {Object} videoAnalysis - Results from video analysis
 * @param {Object} extractedInfo - Previously extracted URL information
 * @returns {Object} - Combined information for category suggestion
 */
function incorporateVideoAnalysis(videoAnalysis, extractedInfo = {}) {
  if (!videoAnalysis) return extractedInfo;
  
  const { creator, keywords = [] } = videoAnalysis;
  const processedKeywords = processVideoAnalysisResults(creator, keywords);
  
  return {
    ...extractedInfo,
    videoCreator: creator,
    videoKeywords: keywords,
    // Combine keywords from both sources
    keywords: [...(extractedInfo.keywords || []), ...processedKeywords]
  };
}

/**
 * Determine if we should create a new category based on confidence
 * 
 * @param {Object} bestMatch - The best category match from our predefined list
 * @param {Object} bestExistingMatch - The best match from user's existing categories
 * @returns {boolean} - Whether to suggest creating a new category
 */
function shouldSuggestNewCategory(bestMatch, bestExistingMatch) {
  // If there's no good match from predefined categories, use existing
  if (!bestMatch || bestMatch.hits <= 0) {
    return false;
  }
  
  // If there's no existing category match, suggest new
  if (!bestExistingMatch) {
    return true;
  }
  
  // If the match is very strong (3+ keyword hits), suggest new category
  if (bestMatch.hits >= 3) {
    return true;
  }
  
  // Otherwise suggest existing
  return false;
}

/**
 * Capitalize the first letter of each word in a string
 * 
 * @param {string} str - String to capitalize
 * @returns {string} - Capitalized string
 */
function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

/**
 * Suggest a category based on keywords found in video URL
 * 
 * @param {Object} item - TikTok item object with URL and redirectUrl
 * @param {Array} availableCategories - Available categories to choose from
 * @returns {Object|null} - Suggested category or null if no match
 */
export function suggestCategory(item, availableCategories) {
  if (!item || !availableCategories || availableCategories.length === 0) {
    return { suggested: false };
  }
  
  // Extract info from URLs
  let extractedInfo = extractInfoFromUrls(item.url, item.redirectUrl);
  
  // Get debugging information
  const analysisInfo = {
    originalUrl: item.url,
    redirectUrl: item.redirectUrl || 'Not resolved yet',
    extractedInfo: extractedInfo,
    categoryMatches: {},
    bestMatch: null,
    allCategoryScores: {},
    creationDecision: null
  };
  
  // If we have available categories, check for direct username matches first
  if (availableCategories?.length > 0 && extractedInfo.username) {
    analysisInfo.usernameMatchChecks = [];
    
    // Try to match with available category titles directly by username
    for (const category of availableCategories) {
      const categoryTitle = category.title.toLowerCase();
      const username = extractedInfo.username.toLowerCase();
      
      // Check if username matches or is contained in category title
      if (categoryTitle.includes(username) || username.includes(categoryTitle)) {
        analysisInfo.usernameMatchChecks.push({
          category: category.title,
          match: true,
          reason: `Username "${username}" matches category "${categoryTitle}"`
        });
        
        return {
          isNewCategory: false,
          categoryId: category.id,
          categoryTitle: category.title,
          confidence: 'High',
          reason: `Creator username "${extractedInfo.username}" matches existing category "${category.title}"`,
          analysis: analysisInfo
        };
      }
      
      analysisInfo.usernameMatchChecks.push({
        category: category.title,
        match: false
      });
    }
  }
  
  // If we have available categories, check for direct keyword matches
  if (availableCategories?.length > 0) {
    analysisInfo.keywordMatchChecks = [];
    
    // First try to match with available category titles directly
    for (const category of availableCategories) {
      const categoryTitle = category.title.toLowerCase();
      
      // Check if any extracted keyword matches or is contained in category title
      for (const keyword of extractedInfo.keywords) {
        const keywordLower = keyword.toLowerCase();
        if (categoryTitle.includes(keywordLower) || keywordLower.includes(categoryTitle)) {
          analysisInfo.keywordMatchChecks.push({
            category: category.title,
            keyword: keyword,
            match: true
          });
          
          return {
            isNewCategory: false,
            categoryId: category.id,
            categoryTitle: category.title,
            confidence: 'High',
            reason: `Found "${keyword}" in ${extractedInfo.extractedFrom} which matches existing category "${category.title}"`,
            analysis: analysisInfo
          };
        }
      }
      
      analysisInfo.keywordMatchChecks.push({
        category: category.title,
        match: false
      });
    }
  }
  
  // Create a map of keyword hits for each predefined category
  const categoryMatches = {};
  
  // Check extracted keywords against our predefined keyword categories
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    categoryMatches[category] = {
      hits: 0,
      matchedKeywords: []
    };
    
    // Count how many keywords from this category appear in the extracted text
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      for (const extractedKeyword of extractedInfo.keywords) {
        const extractedLower = extractedKeyword.toLowerCase();
        
        if (extractedLower.includes(keywordLower) || keywordLower.includes(extractedLower)) {
          categoryMatches[category].hits++;
          categoryMatches[category].matchedKeywords.push({
            predefined: keyword,
            extracted: extractedKeyword,
            source: extractedInfo.extractedFrom
          });
          break; // Count each keyword only once
        }
      }
    }
    
    // Add to analysis info
    analysisInfo.allCategoryScores[category] = {
      hits: categoryMatches[category].hits,
      matchedKeywords: categoryMatches[category].matchedKeywords.map(k => `${k.extracted} matches ${k.predefined}`)
    };
  }
  
  analysisInfo.categoryMatches = categoryMatches;
  
  // Find category with most hits
  let bestMatch = null;
  let maxHits = 0;
  
  for (const [category, data] of Object.entries(categoryMatches)) {
    if (data.hits > maxHits) {
      maxHits = data.hits;
      bestMatch = {
        category,
        hits: data.hits,
        matchedKeywords: data.matchedKeywords
      };
    }
  }
  
  analysisInfo.bestMatch = bestMatch;
  
  // Find best matching existing category if available
  let bestExistingMatch = null;
  if (bestMatch && availableCategories?.length > 0) {
    bestExistingMatch = findMatchingUserCategory(bestMatch.category, availableCategories);
    analysisInfo.bestExistingMatch = bestExistingMatch 
      ? { id: bestExistingMatch.id, title: bestExistingMatch.title }
      : null;
  }
  
  // Decide whether to suggest a new category or use existing one
  const createNewCategory = shouldSuggestNewCategory(bestMatch, bestExistingMatch);
  analysisInfo.creationDecision = {
    createNew: createNewCategory,
    reason: createNewCategory 
      ? (bestExistingMatch ? 'Strong match suggests creating specific category' : 'No matching existing category')
      : 'Existing category is suitable'
  };

  // If we found a good match in our predefined categories
  if (bestMatch && bestMatch.hits > 0) {
    // Prepare reason text
    let keywordReason = bestMatch.matchedKeywords.map(k => 
      `"${k.extracted}" → "${k.predefined}"`
    ).slice(0, 3).join(', ');
    
    if (bestMatch.matchedKeywords.length > 3) {
      keywordReason += `, and ${bestMatch.matchedKeywords.length - 3} more`;
    }
    
    const sourceText = extractedInfo.extractedFrom === 'redirect url' 
      ? 'redirected TikTok URL' 
      : 'TikTok share URL';
    
    const reasonText = `${sourceText} contains ${bestMatch.category}-related keywords: ${keywordReason}`;
    
    if (createNewCategory) {
      // Suggest creating a new category
      const categoryName = toTitleCase(bestMatch.category);
      return {
        isNewCategory: true,
        categoryName: categoryName,
        categoryTitle: categoryName,
        categoryDescription: CATEGORY_DESCRIPTIONS[bestMatch.category] || `${categoryName} content`,
        confidence: bestMatch.hits > 2 ? 'High' : 'Medium',
        reason: reasonText,
        matchedKeywords: bestMatch.matchedKeywords,
        analysis: analysisInfo
      };
    } else if (bestExistingMatch) {
      // Use existing category that's similar to our match
      return {
        isNewCategory: false,
        categoryId: bestExistingMatch.id,
        categoryTitle: bestExistingMatch.title,
        confidence: bestMatch.hits > 2 ? 'Medium' : 'Low',
        reason: reasonText,
        analysis: analysisInfo
      };
    }
  }
  
  // Fallback - suggest the first category as a reasonable default if available
  if (availableCategories?.length > 0) {
    return {
      isNewCategory: false,
      categoryId: availableCategories[0].id,
      categoryTitle: availableCategories[0].title,
      confidence: 'Low',
      reason: extractedInfo.keywords.length > 0 
        ? `No clear category match found for keywords: ${extractedInfo.keywords.join(', ')}`
        : 'No clear category match found',
      analysis: analysisInfo
    };
  } else {
    // No categories at all - suggest a generic new one based on best match
    if (bestMatch && bestMatch.hits > 0) {
      const categoryName = toTitleCase(bestMatch.category);
      return {
        isNewCategory: true,
        categoryName: categoryName,
        categoryTitle: categoryName,
        categoryDescription: CATEGORY_DESCRIPTIONS[bestMatch.category] || `${categoryName} content`,
        confidence: 'Low',
        reason: `Limited information suggests this might be ${bestMatch.category}-related content`,
        matchedKeywords: bestMatch.matchedKeywords,
        analysis: analysisInfo
      };
    } else {
      // If all else fails, suggest a general category
      return {
        isNewCategory: true,
        categoryName: 'TikTok Favorites',
        categoryTitle: 'TikTok Favorites',
        categoryDescription: 'A collection of favorite TikTok videos',
        confidence: 'Low',
        reason: 'No category matches found, suggesting a general category',
        analysis: analysisInfo
      };
    }
  }
}

/**
 * Find a user category that matches the predefined category name
 * 
 * @param {string} categoryName - Predefined category name
 * @param {Array} userCategories - User-defined categories
 * @returns {Object|null} - Matching user category or null
 */
function findMatchingUserCategory(categoryName, userCategories) {
  // First try exact or partial matches with category titles
  for (const category of userCategories) {
    const titleLower = category.title.toLowerCase();
    const categoryLower = categoryName.toLowerCase();
    
    if (titleLower === categoryLower || 
        titleLower.includes(categoryLower) || 
        categoryLower.includes(titleLower)) {
      return category;
    }
  }
  
  // If no title match, try to match with subcategory names
  for (const category of userCategories) {
    if (category.subcategories && category.subcategories.length > 0) {
      for (const subcategory of category.subcategories) {
        const subNameLower = subcategory.name.toLowerCase();
        const categoryLower = categoryName.toLowerCase();
        
        if (subNameLower === categoryLower || 
            subNameLower.includes(categoryLower) || 
            categoryLower.includes(subNameLower)) {
          return category; // Return the parent category
        }
      }
    }
  }
  
  // If still no match, just return null - we'll suggest a new category
  return null;
} 