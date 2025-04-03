package com.tiktokservice.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * Represents the result of analyzing a TikTok video
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VideoAnalysisResult {
    private String creator;
    private List<String> keywords;
    private List<String> hashTags;
    private String title;
    private String description;
    private boolean isSuccessful;
} 