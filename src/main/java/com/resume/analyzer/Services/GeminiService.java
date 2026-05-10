package com.resume.analyzer.Services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService { // Keeping name to avoid breaking Controller, but logic is now Groq

    private final RestTemplate restTemplate;

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.base-url}")
    private String baseUrl;

    @Value("${groq.model}")
    private String model;

    public String getChatResponse(String userQuery) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            // OpenAI / Groq compatible format
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "You are the AI Assistant for the ATS Analyzer platform. " +
                "You help users optimize their resumes and career paths. " +
                "IMPORTANT: You cannot receive file uploads directly in this chat. " +
                "If a user wants to analyze or fix their resume, tell them to go to the 'Neural ATS' page from the navigation bar (or '/analyzer' route) to upload their PDF file for deep ingestion. " +
                "Be futuristic, professional, and helpful."));
            messages.add(Map.of("role", "user", "content", userQuery));
            
            requestBody.put("messages", messages);
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(baseUrl, entity, Map.class);

            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    return (String) message.get("content");
                }
            }
            return "I'm sorry, I couldn't process that request right now.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Neural Link Error (Groq): " + e.getMessage();
        }
    }
}
