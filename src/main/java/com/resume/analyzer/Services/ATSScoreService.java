package com.resume.analyzer.Services;

import com.resume.analyzer.Model.ATSScore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
public class ATSScoreService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    private static final String MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
        You are an elite ATS Expert. Return ONLY a JSON object:
        {
          "score": [1-100],
          "recommendation": "string",
          "strengths": ["string"],
          "weaknesses": ["string"],
          "marketSearchQuery": "actual job title",
          "categoryScores": {"format": 20, "keywords": 30, "achievements": 20, "skills": 30}
        }
        """;

    public ATSScore calculateScore(String resumeText) {
        return calculateScore(resumeText, "");
    }

    public ATSScore calculateScore(String resumeText, String jobDescription) {
        try {
            log.info("Agent 1 (ATS) Initiating Analysis...");
            
            String userPrompt = "Analyze this resume. " + (jobDescription.isEmpty() ? "" : "Compare against JD: " + jobDescription) + "\n\nResume: " + resumeText;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "open-mistral-nemo");
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", SYSTEM_PROMPT),
                Map.of("role", "user", "content", userPrompt)
            ));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.postForObject(MISTRAL_URL, entity, String.class);

            JsonNode root = objectMapper.readTree(response);
            String content = root.path("choices").get(0).path("message").path("content").asText();
            
            // Clean content from markdown
            if (content.contains("```json")) {
                content = content.substring(content.indexOf("```json") + 7, content.lastIndexOf("```"));
            } else if (content.contains("```")) {
                content = content.substring(content.indexOf("```") + 3, content.lastIndexOf("```"));
            }

            JsonNode node = objectMapper.readTree(content);
            Map<String, Integer> catScores = new HashMap<>();
            JsonNode catNode = node.path("categoryScores");
            catScores.put("format", catNode.path("format").asInt(20));
            catScores.put("keywords", catNode.path("keywords").asInt(30));
            catScores.put("achievements", catNode.path("achievements").asInt(20));
            catScores.put("skills", catNode.path("skills").asInt(30));

            log.info("Agent 1 (ATS) Success. Score: {}", node.path("score").asInt());

            return ATSScore.builder()
                .score(node.path("score").asInt(0))
                .recommendation(node.path("recommendation").asText(""))
                .marketSearchQuery(node.path("marketSearchQuery").asText("Developer"))
                .strengths(convertList(node.path("strengths")))
                .weaknesses(convertList(node.path("weaknesses")))
                .categoryScores(catScores)
                .build();
        } catch (Exception e) {
            log.error("Agent 1 (ATS) Failure", e);
            return createErrorScore("Agent failure: " + e.getMessage());
        }
    }

    private List<String> convertList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node.isArray()) node.forEach(n -> list.add(n.asText()));
        return list;
    }

    private ATSScore createErrorScore(String error) {
        return ATSScore.builder().score(0).recommendation(error).categoryScores(new HashMap<>()).build();
    }
}