package com.tiktokservice.service.impl;

import com.tiktokservice.model.TikTokItem;
import com.tiktokservice.model.VideoAnalysisResult;
import com.tiktokservice.service.TikTokService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.config.CookieSpecs;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpHead;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.UUID;

/**
 * Implementation of the TikTok service
 */
@Slf4j
@Service
public class TikTokServiceImpl implements TikTokService {

    // Directory to store downloaded videos
    private static final String DOWNLOAD_DIR = "tiktok-videos";

    // User agent to use for requests
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

    // Initialize download directory
    public TikTokServiceImpl() {
        try {
            Path downloadPath = Paths.get(DOWNLOAD_DIR);
            if (!Files.exists(downloadPath)) {
                Files.createDirectories(downloadPath);
                log.info("Created download directory: {}", downloadPath.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Failed to create download directory", e);
        }
    }

    @Override
    public TikTokItem resolveTikTokUrl(String url) throws IOException {
        log.info("Resolving TikTok URL: {}", url);
        
        String finalUrl = resolveRedirect(url);
        log.info("Resolved TikTok URL to: {}", finalUrl);
        
        // Extract creator username from the URL
        String creatorUsername = extractCreatorUsername(finalUrl);
        
        // Create a TikTok item with the available metadata
        TikTokItem item = TikTokItem.builder()
                .id(UUID.randomUUID().toString())
                .url(url)
                .redirectUrl(finalUrl)
                .creatorUsername(creatorUsername)
                .build();
        
        // Try to get additional metadata by parsing the TikTok page
        try {
            enrichTikTokItem(item);
        } catch (Exception e) {
            log.warn("Failed to extract additional metadata: {}", e.getMessage());
        }
        
        return item;
    }

    @Override
    public String downloadTikTokVideo(String url) throws IOException {
        log.info("Downloading TikTok video from URL: {}", url);
        
        // First, resolve the redirect to get the full TikTok URL
        String finalUrl = resolveRedirect(url);
        log.info("Resolved to final URL: {}", finalUrl);
        
        // Extract video ID for filename
        String videoId = extractVideoId(finalUrl);
        if (videoId == null) {
            videoId = UUID.randomUUID().toString();
        }
        
        // Try to extract the direct video URL
        String videoUrl = extractVideoUrl(finalUrl);
        
        if (videoUrl == null) {
            log.error("Could not extract video URL from TikTok page");
            throw new IOException("Failed to extract video URL");
        }
        
        // Download the video
        String filename = videoId + ".mp4";
        Path filePath = Paths.get(DOWNLOAD_DIR, filename);
        
        try (CloseableHttpClient httpClient = createHttpClient()) {
            HttpGet httpGet = new HttpGet(videoUrl);
            httpGet.setHeader("User-Agent", USER_AGENT);
            httpGet.setHeader("Referer", finalUrl);
            
            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                HttpEntity entity = response.getEntity();
                if (entity != null) {
                    FileUtils.copyInputStreamToFile(entity.getContent(), filePath.toFile());
                    log.info("Video downloaded successfully to: {}", filePath);
                    return filePath.toString();
                }
            }
        }
        
        throw new IOException("Failed to download video");
    }

    @Override
    public List<TikTokItem> processTikTokList(MultipartFile file) throws IOException {
        log.info("Processing TikTok list from file: {}", file.getOriginalFilename());
        
        List<TikTokItem> items = new ArrayList<>();
        
        // Read the text file
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String entry = "";
            String line;
            
            while ((line = reader.readLine()) != null) {
                // Add the line to the current entry
                entry += line + "\n";
                
                // If line is empty, process the entry
                if (line.trim().isEmpty()) {
                    TikTokItem item = processEntry(entry);
                    if (item != null) {
                        items.add(item);
                    }
                    entry = "";
                }
            }
            
            // Process the last entry if not empty
            if (!entry.trim().isEmpty()) {
                TikTokItem item = processEntry(entry);
                if (item != null) {
                    items.add(item);
                }
            }
        }
        
        log.info("Processed {} TikTok items", items.size());
        return items;
    }
    
    /**
     * Process a single TikTok entry from the list
     */
    private TikTokItem processEntry(String entry) {
        // Extract date and URL
        String date = null;
        String url = null;
        
        // Match patterns for "Date:" and "URL:" or "Link:"
        Pattern datePattern = Pattern.compile("Date:\\s*(.+)", Pattern.CASE_INSENSITIVE);
        Pattern urlPattern = Pattern.compile("(URL|Link):\\s*(.+)", Pattern.CASE_INSENSITIVE);
        
        for (String line : entry.split("\n")) {
            Matcher dateMatcher = datePattern.matcher(line);
            if (dateMatcher.find()) {
                date = dateMatcher.group(1).trim();
            }
            
            Matcher urlMatcher = urlPattern.matcher(line);
            if (urlMatcher.find()) {
                url = urlMatcher.group(2).trim();
            }
        }
        
        if (date != null && url != null) {
            return TikTokItem.builder()
                    .id(UUID.randomUUID().toString())
                    .date(date)
                    .url(url)
                    .build();
        }
        
        return null;
    }
    
    /**
     * Resolve a TikTok URL to its final destination after redirects
     */
    private String resolveRedirect(String url) throws IOException {
        try (CloseableHttpClient httpClient = createHttpClient()) {
            HttpHead httpHead = new HttpHead(url);
            httpHead.setHeader("User-Agent", USER_AGENT);
            
            try (CloseableHttpResponse response = httpClient.execute(httpHead)) {
                // Check if this is a redirect
                int statusCode = response.getStatusLine().getStatusCode();
                
                if (statusCode >= 300 && statusCode < 400) {
                    String location = response.getFirstHeader("Location").getValue();
                    log.info("Redirect detected: {} -> {}", url, location);
                    return location;
                }
            }
        }
        
        // Try with GET request if HEAD doesn't give a redirect
        try (CloseableHttpClient httpClient = createHttpClient()) {
            HttpGet httpGet = new HttpGet(url);
            httpGet.setHeader("User-Agent", USER_AGENT);
            
            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                String finalUrl = response.getLastHeader("Location") != null
                        ? response.getLastHeader("Location").getValue()
                        : url;
                        
                // If we still have the original URL, check if the request URL was changed
                if (finalUrl.equals(url)) {
                    URI uri = httpGet.getURI();
                    if (!uri.toString().equals(url)) {
                        finalUrl = uri.toString();
                    }
                }
                
                return finalUrl;
            }
        }
    }
    
    /**
     * Extract the creator username from a TikTok URL
     */
    private String extractCreatorUsername(String url) {
        Pattern pattern = Pattern.compile("tiktok\\.com/@([^/]+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(url);
        
        if (matcher.find()) {
            return "@" + matcher.group(1);
        }
        
        return null;
    }
    
    /**
     * Extract the video ID from a TikTok URL
     */
    private String extractVideoId(String url) {
        // Handle various TikTok URL formats
        List<Pattern> patterns = Arrays.asList(
            Pattern.compile("tiktok\\.com/.*?/video/(\\d+)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("tiktokv\\.com/.*?/video/(\\d+)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("tiktok\\.com/@[^/]+/video/(\\d+)", Pattern.CASE_INSENSITIVE),
            Pattern.compile("vm\\.tiktok\\.com/(\\w+)", Pattern.CASE_INSENSITIVE)
        );
        
        for (Pattern pattern : patterns) {
            Matcher matcher = pattern.matcher(url);
            if (matcher.find()) {
                return matcher.group(1);
            }
        }
        
        // If no pattern matched but URL ends with digits, use that as fallback
        Pattern digitsPattern = Pattern.compile("(\\d+)$");
        Matcher matcher = digitsPattern.matcher(url);
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        return null;
    }
    
    /**
     * Extract the direct video URL from a TikTok page
     */
    private String extractVideoUrl(String tiktokUrl) {
        try (CloseableHttpClient httpClient = createHttpClient()) {
            HttpGet httpGet = new HttpGet(tiktokUrl);
            httpGet.setHeader("User-Agent", USER_AGENT);
            
            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                String html = IOUtils.toString(response.getEntity().getContent(), StandardCharsets.UTF_8);
                
                // Try to find the video URL in the HTML using regex
                // This pattern might need to be updated as TikTok changes their site
                Pattern pattern = Pattern.compile("\"playAddr\":\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
                Matcher matcher = pattern.matcher(html);
                
                if (matcher.find()) {
                    String videoUrl = matcher.group(1);
                    // Unescape the URL
                    videoUrl = videoUrl.replace("\\u002F", "/");
                    return videoUrl;
                }
                
                // Try another pattern if the first one didn't match
                pattern = Pattern.compile("\"downloadAddr\":\"([^\"]+)\"", Pattern.CASE_INSENSITIVE);
                matcher = pattern.matcher(html);
                
                if (matcher.find()) {
                    String videoUrl = matcher.group(1);
                    // Unescape the URL
                    videoUrl = videoUrl.replace("\\u002F", "/");
                    return videoUrl;
                }
            }
        } catch (IOException e) {
            log.error("Error extracting video URL", e);
        }
        
        return null;
    }
    
    /**
     * Enrich a TikTok item with additional metadata by parsing the TikTok page
     */
    private void enrichTikTokItem(TikTokItem item) throws IOException {
        String url = item.getRedirectUrl() != null ? item.getRedirectUrl() : item.getUrl();
        
        try (CloseableHttpClient httpClient = createHttpClient()) {
            HttpGet httpGet = new HttpGet(url);
            httpGet.setHeader("User-Agent", USER_AGENT);
            
            try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
                String html = IOUtils.toString(response.getEntity().getContent(), StandardCharsets.UTF_8);
                Document doc = Jsoup.parse(html);
                
                // Extract metadata from meta tags
                String title = extractMetaContent(doc, "og:title");
                String description = extractMetaContent(doc, "og:description");
                String thumbnailUrl = extractMetaContent(doc, "og:image");
                String videoUrl = extractMetaContent(doc, "og:video");
                
                // Extract hashtags from the description
                List<String> hashtags = extractHashtags(description);
                
                // Extract keywords from title and description
                List<String> keywords = extractKeywords(title, description);
                
                // Update the TikTok item with the extracted metadata
                item.setTitle(title);
                item.setDescription(description);
                item.setThumbnailUrl(thumbnailUrl);
                item.setVideoUrl(videoUrl);
                
                // Create video analysis result
                VideoAnalysisResult videoAnalysis = VideoAnalysisResult.builder()
                        .creator(item.getCreatorUsername())
                        .title(title)
                        .description(description)
                        .hashTags(hashtags)
                        .keywords(keywords)
                        .isSuccessful(true)
                        .build();
                
                item.setVideoAnalysis(videoAnalysis);
            }
        } catch (Exception e) {
            log.error("Error enriching TikTok item", e);
            throw e;
        }
    }
    
    /**
     * Extract content from a meta tag
     */
    private String extractMetaContent(Document doc, String property) {
        return doc.select("meta[property=" + property + "]").attr("content");
    }
    
    /**
     * Extract hashtags from text
     */
    private List<String> extractHashtags(String text) {
        if (text == null) {
            return Collections.emptyList();
        }
        
        List<String> hashtags = new ArrayList<>();
        Pattern pattern = Pattern.compile("#(\\w+)");
        Matcher matcher = pattern.matcher(text);
        
        while (matcher.find()) {
            hashtags.add(matcher.group(0));
        }
        
        return hashtags;
    }
    
    /**
     * Extract keywords from title and description
     */
    private List<String> extractKeywords(String title, String description) {
        Set<String> keywords = new HashSet<>();
        
        // Common words to ignore
        Set<String> stopWords = new HashSet<>(Arrays.asList(
                "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", 
                "has", "have", "had", "do", "does", "did", "of", "to", "in", "for", 
                "with", "on", "at", "by", "about", "like", "this", "that", "these", 
                "those", "my", "your", "his", "her", "its", "our", "their"
        ));
        
        // Process title
        if (title != null) {
            Arrays.stream(title.toLowerCase().split("\\W+"))
                    .filter(word -> word.length() > 2)
                    .filter(word -> !stopWords.contains(word))
                    .forEach(keywords::add);
        }
        
        // Process description
        if (description != null) {
            Arrays.stream(description.toLowerCase().split("\\W+"))
                    .filter(word -> word.length() > 2)
                    .filter(word -> !stopWords.contains(word))
                    .forEach(keywords::add);
        }
        
        return new ArrayList<>(keywords);
    }
    
    /**
     * Create an HTTP client configured for handling redirects
     */
    private CloseableHttpClient createHttpClient() {
        RequestConfig config = RequestConfig.custom()
                .setConnectTimeout(30000)
                .setSocketTimeout(30000)
                .setConnectionRequestTimeout(30000)
                .setCookieSpec(CookieSpecs.STANDARD)
                .setRedirectsEnabled(true)
                .build();
                
        return HttpClients.custom()
                .setDefaultRequestConfig(config)
                .build();
    }
} 