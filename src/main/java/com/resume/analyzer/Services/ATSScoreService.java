package com.resume.analyzer.Services;

import com.resume.analyzer.Model.ATSScore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ATSScoreService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    private static final String MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

    public ATSScore calculateScore(String resumeText, String jobDescription) {
        try {
            String prompt = "Act as an advanced ATS Intelligence Agent. Analyze this resume against the job description.\n" +
                    "RESUME: " + resumeText + "\n" +
                    "JOB: " + jobDescription + "\n\n" +
                    "Return ONLY a raw JSON object with these EXACT keys:\n" +
                    "score (0-100 integer), recommendation (2-3 sentences), strengths (array of 4 strings), " +
                    "weaknesses (array of 4 strings), categoryScores (object with: Skills, Formatting, Keywords, Experience as integers), " +
                    "marketSearchQuery (string), trajectory (array of 6 strings), " +
                    "opportunities (array of objects: {title, desc}), resources (array of objects: {name, url}).\n" +
                    "CRITICAL: NO MARKDOWN. NO CONVERSATION. ONLY JSON.";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey.trim());

            Map<String, Object> body = new HashMap<>();
            body.put("model", "mistral-tiny"); // You can also try 'mistral-small' for better logic
            body.put("messages", List.of(Map.of("role", "user", "content", prompt)));
            body.put("temperature", 0.1); // Lower temperature for more consistent JSON

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(MISTRAL_URL, entity, String.class);
            
            log.info("Neural Agent Response Received");
            return parseMistralResponse(response.getBody());
        } catch (Exception e) {
            log.error("Neural Agent Bridge Failed: " + e.getMessage());
            return fallbackScore();
        }
    }

    private ATSScore parseMistralResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            content = content.replaceAll("```json", "").replaceAll("```", "").replaceAll("\\*\\*", "").trim();
            JsonNode data = objectMapper.readTree(content);

            List<String> trajectory = new ArrayList<>();
            data.path("trajectory").forEach(n -> trajectory.add(n.asText()));

            List<Map<String, String>> opps = new ArrayList<>();
            data.path("opportunities").forEach(n -> {
                Map<String, String> m = new HashMap<>();
                m.put("title", n.path("title").asText());
                m.put("desc", n.path("desc").asText());
                opps.add(m);
            });

            List<Map<String, String>> resources = new ArrayList<>();
            data.path("resources").forEach(n -> {
                Map<String, String> m = new HashMap<>();
                m.put("name", n.path("name").asText());
                m.put("url", n.path("url").asText());
                resources.add(m);
            });

            return ATSScore.builder()
                    .score(data.path("score").asInt())
                    .recommendation(data.path("recommendation").asText())
                    .strengths(objectMapper.convertValue(data.path("strengths"), List.class))
                    .weaknesses(objectMapper.convertValue(data.path("weaknesses"), List.class))
                    .categoryScores(objectMapper.convertValue(data.path("categoryScores"), Map.class))
                    .marketSearchQuery(data.path("marketSearchQuery").asText())
                    .trajectory(trajectory)
                    .opportunities(opps)
                    .resources(resources)
                    .build();
        } catch (Exception e) {
            log.error("Parsing Failed", e);
            return fallbackScore();
        }
    }

    private ATSScore fallbackScore() {
        return ATSScore.builder()
                .score(45)
                .recommendation("Agent connection limited.")
                .trajectory(List.of("Step 1: Verify Connection", "Step 2: Retry Scan"))
                .resources(List.of(Map.of("name", "Google Analytics Course", "url", "https://skillshop.exceedlms.com/")))
                .build();
    }
}