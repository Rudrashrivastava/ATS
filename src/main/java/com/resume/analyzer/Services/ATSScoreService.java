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

    public ATSScore calculateScore(String resumeText) {
        return calculateScore(resumeText, "General technology roles");
    }

    public ATSScore calculateScore(String resumeText, String jobDescription) {
        try {
            String prompt = "Analyze this resume against this job description. Return ONLY a valid JSON object with these fields: " +
                    "score (0-100), recommendation (short summary), strengths (list), weaknesses (list), " +
                    "categoryScores (map of SkillName:Score), marketSearchQuery (a 3-word role title), " +
                    "trajectory (list of 6 actionable career steps), " +
                    "opportunities (list of 3 objects with: title, company, location, desc). " +
                    "Resume: " + resumeText + " Job: " + jobDescription;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> body = new HashMap<>();
            body.put("model", "mistral-tiny");
            body.put("messages", List.of(Map.of("role", "user", "content", prompt)));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(MISTRAL_URL, entity, String.class);

            return parseMistralResponse(response.getBody());
        } catch (Exception e) {
            log.error("AI Agent Failed", e);
            return fallbackScore();
        }
    }

    private ATSScore parseMistralResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            
            // Cleanup markdown
            content = content.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode data = objectMapper.readTree(content);

            List<String> trajectory = new ArrayList<>();
            data.path("trajectory").forEach(n -> trajectory.add(n.asText()));

            List<Map<String, String>> opps = new ArrayList<>();
            data.path("opportunities").forEach(n -> {
                Map<String, String> m = new HashMap<>();
                m.put("title", n.path("title").asText());
                m.put("company", n.path("company").asText());
                m.put("location", n.path("location").asText());
                m.put("desc", n.path("desc").asText());
                opps.add(m);
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
                    .build();
        } catch (Exception e) {
            log.error("Parsing Failed", e);
            return fallbackScore();
        }
    }

    private ATSScore fallbackScore() {
        return ATSScore.builder()
                .score(45)
                .recommendation("Agent connection limited. Please retry for full analysis.")
                .marketSearchQuery("System Analysis")
                .trajectory(List.of("Step 1: Check Connection", "Step 2: Retry Upload", "Step 3: Verify API Key"))
                .build();
    }
}