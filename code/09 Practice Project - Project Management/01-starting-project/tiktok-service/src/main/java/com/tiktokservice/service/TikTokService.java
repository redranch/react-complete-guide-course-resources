package com.tiktokservice.service;

import com.tiktokservice.model.TikTokItem;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Service interface for TikTok metadata and video operations
 */
public interface TikTokService {

    /**
     * Resolve a TikTok URL to extract metadata
     * 
     * @param url the TikTok URL to resolve
     * @return the TikTok item with metadata
     */
    TikTokItem resolveTikTokUrl(String url) throws IOException;

    /**
     * Download a TikTok video
     * 
     * @param url the TikTok URL
     * @return the path to the downloaded video
     */
    String downloadTikTokVideo(String url) throws IOException;

    /**
     * Process a list of TikTok URLs from a text file
     * 
     * @param file the text file containing TikTok URLs
     * @return list of processed TikTok items
     */
    List<TikTokItem> processTikTokList(MultipartFile file) throws IOException;
} 