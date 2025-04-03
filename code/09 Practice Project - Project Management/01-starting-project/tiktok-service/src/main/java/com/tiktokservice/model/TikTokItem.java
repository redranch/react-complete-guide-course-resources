package com.tiktokservice.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a TikTok item with metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TikTokItem {
    private String id;
    private String date;
    private String url;
    private String redirectUrl;
    private String creatorUsername;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String videoUrl;
    private String notes;
    private String categoryId;
    private String subcategoryId;
    private String nestedSubcategoryId;
    private VideoAnalysisResult videoAnalysis;
} 