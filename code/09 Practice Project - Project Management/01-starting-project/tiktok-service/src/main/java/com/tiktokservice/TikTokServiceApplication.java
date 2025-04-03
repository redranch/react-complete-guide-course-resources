package com.tiktokservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * TikTok Service Application
 * This is a server-side application that provides APIs for:
 * - Resolving TikTok share URLs to extract metadata
 * - Downloading TikTok videos (where possible)
 * - Processing TikTok lists from text files
 */
@SpringBootApplication
public class TikTokServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TikTokServiceApplication.class, args);
    }

    /**
     * Configure CORS to allow requests from the React frontend
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Allow requests from the local React app
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:3002") // Match the port of your React app
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
} 