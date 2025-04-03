package com.tiktokservice.controller;

import com.tiktokservice.model.TikTokItem;
import com.tiktokservice.service.TikTokService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * Controller for TikTok-related operations
 */
@Slf4j
@RestController
@RequestMapping("/api/tiktok")
@RequiredArgsConstructor
public class TikTokController {

    private final TikTokService tikTokService;

    /**
     * Resolve a TikTok URL and extract metadata
     * 
     * @param requestBody Map containing the TikTok URL to resolve
     * @return TikTok item with metadata
     */
    @PostMapping("/resolve")
    public ResponseEntity<?> resolveTikTokUrl(@RequestBody Map<String, String> requestBody) {
        String url = requestBody.get("url");
        
        if (url == null || url.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        try {
            TikTokItem tikTokItem = tikTokService.resolveTikTokUrl(url);
            return ResponseEntity.ok(tikTokItem);
        } catch (Exception e) {
            log.error("Error resolving TikTok URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to resolve TikTok URL: " + e.getMessage()));
        }
    }
    
    /**
     * Download a TikTok video
     * 
     * @param requestBody Map containing the TikTok URL to download
     * @return Path to the downloaded video
     */
    @PostMapping("/download")
    public ResponseEntity<?> downloadTikTokVideo(@RequestBody Map<String, String> requestBody) {
        String url = requestBody.get("url");
        
        if (url == null || url.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        
        try {
            String filePath = tikTokService.downloadTikTokVideo(url);
            return ResponseEntity.ok(Map.of(
                "message", "Video downloaded successfully",
                "filePath", filePath,
                "downloadUrl", "/api/tiktok/video/" + new File(filePath).getName()
            ));
        } catch (Exception e) {
            log.error("Error downloading TikTok video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to download video: " + e.getMessage()));
        }
    }
    
    /**
     * Process a TikTok list from a file
     * 
     * @param file The file containing the TikTok list
     * @return List of processed TikTok items
     */
    @PostMapping(value = "/process-list", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> processTikTokList(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is required"));
        }
        
        try {
            List<TikTokItem> items = tikTokService.processTikTokList(file);
            return ResponseEntity.ok(Map.of(
                "message", "TikTok list processed successfully",
                "count", items.size(),
                "items", items
            ));
        } catch (Exception e) {
            log.error("Error processing TikTok list", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process TikTok list: " + e.getMessage()));
        }
    }
    
    /**
     * Get a downloaded video by filename
     * 
     * @param filename The filename of the video to retrieve
     * @return The video file
     */
    @GetMapping("/video/{filename:.+}")
    public ResponseEntity<?> getVideo(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("tiktok-videos", filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("video/mp4"))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving video", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve video: " + e.getMessage()));
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "up", "service", "TikTok Service"));
    }
} 