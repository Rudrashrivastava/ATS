package com.resume.analyzer.Services;


import com.resume.analyzer.Model.ATSScore;
// import com.resume.analyzer.Model.Settings;
// import lombok.RequiredArgsConstructor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
public class ATSScoreService {

    private final ChatClient chatClient;

    @Autowired
    public ATSScoreService(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    private static final String SYSTEM_PROMPT = """
        You are an elite Technical Recruiter and ATS Optimization Expert. Your mission is to provide a brutal, highly accurate, and objective analysis of resumes.
        
        CRITICAL SCORING RULES:
        1. BE DYNAMIC: Every resume is different. Never default to a middle-ground score like 75. 
        2. BE TOUGH: High scores (90+) are only for perfect matches. Low scores (under 50) are for poor quality or complete mismatches.
        3. JD ALIGNMENT: If a Job Description (JD) is provided, the 'Keywords and relevance' and 'Skills' scores MUST reflect how well the candidate fits that specific role. 
        4. MISMATCH DETECTION: If the resume is completely irrelevant to the target job (e.g. a chef applying for a developer role), the overall score MUST be below 20%.
        
        Return your analysis ONLY in a valid JSON format:
        {
          "score": [overall score 1-100],
          "recommendation": "[concise actionable advice, mention mismatch if it exists]",
          "strengths": ["list of top 3 professional strengths"],
          "weaknesses": ["list of top 3 critical areas for improvement"],
          "marketSearchQuery": "[IDENTIFY THE CANDIDATE'S ACTUAL ROLE based on the resume text, NOT the target job. If they are a student, say 'Student'. If they are a mismatched professional, say their actual title (e.g. 'Customer Service Representative')]",
          "categoryScores": {
            "format": [score 0-20],
            "keywords": [score 0-30],
            "achievements": [score 0-20],
            "skills": [score 0-30]
          }
        }
        """;
    
    private static final String USER_PROMPT_WITHOUT_JD = """
        Please perform a deep-dive ATS analysis on the following resume text. 
        Identify the primary role and evaluate general industry standards.
        
        RESUME CONTENT:
        {resumeText}
        """;
    
    private static final String USER_PROMPT_WITH_JD = """
        Please perform a targeted ATS analysis comparing the following resume against the specific job description provided.
        Calculate the compatibility score based strictly on the requirements listed in the JD.
        
        JOB DESCRIPTION:
        {jobDescription}
        
        RESUME CONTENT:
        {resumeText}
        """;
    
    /**
     * Calculates ATS score for a resume
     *
     * @param resumeText The text extracted from the resume
     * @return ATSScore object containing the score and feedback
     */
    public ATSScore calculateScore(String resumeText) {
        return calculateScore(resumeText, null);
    }
    
    /**
     * Calculates ATS score for a resume against a specific job description
     *
     * @param resumeText     The text extracted from the resume
     * @param jobDescription Optional job description to match against
     * @return ATSScore object containing the score and feedback
     */
    public ATSScore calculateScore(String resumeText, String jobDescription) {
        try {
            if (chatClient == null) {
                return createErrorScore("AI service is not configured. Please set up your API key in application.properties.");
            }

            String finalUserPrompt;
            if (jobDescription != null && !jobDescription.trim().isEmpty()) {
                finalUserPrompt = USER_PROMPT_WITH_JD
                        .replace("{jobDescription}", jobDescription)
                        .replace("{resumeText}", resumeText);
                log.info("Performing Targeted Analysis (Resume + JD)");
            } else {
                finalUserPrompt = USER_PROMPT_WITHOUT_JD
                        .replace("{resumeText}", resumeText);
                log.info("Performing General Analysis (Resume Only)");
            }

            log.debug("Full Prompt to AI: \nSYSTEM: {}\nUSER: {}", SYSTEM_PROMPT, finalUserPrompt);

            String content = chatClient.prompt()
                    .user(finalUserPrompt)
                    .system(SYSTEM_PROMPT)
                    .call()
                    .content();

            log.info("AI Analysis Received successfully.");
            log.debug("Raw AI response content: {}", content);
            
            return parseResponse(content);
        } catch (Exception e) {
            log.error("Critical error during AI ATS calculation", e);
            return createErrorScore("Analysis Engine Error: " + e.getMessage());
        }
    }
    
    private ATSScore parseResponse(String jsonResponse) {
        try {
            // Remove markdown code blocks and any leading/trailing text
            String cleanJson = jsonResponse.trim();
            int firstBrace = cleanJson.indexOf("{");
            int lastBrace = cleanJson.lastIndexOf("}");
            
            if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(cleanJson);

            int score = root.path("score").asInt();
            String recommendation = root.path("recommendation").asText();
            String marketQuery = root.path("marketSearchQuery").asText("developer");
            
            List<String> strengths = new ArrayList<>();
            root.path("strengths").forEach(s -> strengths.add(s.asText()));
            
            List<String> weaknesses = new ArrayList<>();
            root.path("weaknesses").forEach(w -> weaknesses.add(w.asText()));
            
            Map<String, Integer> categoryScores = new HashMap<>();
            JsonNode catNode = root.path("categoryScores");
            categoryScores.put("format", catNode.path("format").asInt());
            categoryScores.put("keywords", catNode.path("keywords").asInt());
            categoryScores.put("achievements", catNode.path("achievements").asInt());
            categoryScores.put("skills", catNode.path("skills").asInt());
            
            return ATSScore.builder()
                    .score(score)
                    .recommendation(recommendation)
                    .marketSearchQuery(marketQuery)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .categoryScores(categoryScores)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error parsing AI JSON response. Raw content: {}", jsonResponse, e);
            // Fallback to regex if Jackson fails
            return parseResponseLegacy(jsonResponse);
        }
    }

    private ATSScore parseResponseLegacy(String jsonResponse) {
        try {
            int score = extractIntValue(jsonResponse, "score");
            String recommendation = extractStringValue(jsonResponse, "recommendation");
            String marketQuery = extractStringValue(jsonResponse, "marketSearchQuery");
            if (marketQuery == null || marketQuery.isEmpty()) marketQuery = "developer";
            
            List<String> strengths = extractStringList(jsonResponse, "strengths");
            List<String> weaknesses = extractStringList(jsonResponse, "weaknesses");
            
            Map<String, Integer> categoryScores = new HashMap<>();
            categoryScores.put("format", extractNestedIntValue(jsonResponse, "categoryScores", "format"));
            categoryScores.put("keywords", extractNestedIntValue(jsonResponse, "categoryScores", "keywords"));
            categoryScores.put("achievements", extractNestedIntValue(jsonResponse, "categoryScores", "achievements"));
            categoryScores.put("skills", extractNestedIntValue(jsonResponse, "categoryScores", "skills"));
            
            return ATSScore.builder()
                    .score(score)
                    .recommendation(recommendation)
                    .marketSearchQuery(marketQuery)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .categoryScores(categoryScores)
                    .build();
        } catch (Exception e) {
            return createErrorScore("Parsing failure: " + e.getMessage());
        }
    }
    
    // These methods are simplistic - in production code, use a proper JSON library
    private int extractIntValue(String json, String key) {
        // Simple implementation for demo purposes
        String pattern = "\"" + key + "\"\\s*:\\s*(\\d+)";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = r.matcher(json);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 0;
    }
    
    private String extractStringValue(String json, String key) {
        String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]*)\"";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = r.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return "";
    }
    
    private List<String> extractStringList(String json, String key) {
        List<String> results = new ArrayList<>();
        String listPattern = "\"" + key + "\"\\s*:\\s*\\[(.*?)\\]";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(listPattern, java.util.regex.Pattern.DOTALL);
        java.util.regex.Matcher m = r.matcher(json);
        
        if (m.find()) {
            String listContent = m.group(1);
            String itemPattern = "\"([^\"]*)\"";
            java.util.regex.Pattern itemR = java.util.regex.Pattern.compile(itemPattern);
            java.util.regex.Matcher itemM = itemR.matcher(listContent);
            
            while (itemM.find()) {
                results.add(itemM.group(1));
            }
        }
        return results;
    }
    
    private int extractNestedIntValue(String json, String parentKey, String childKey) {
        String nestedPattern = "\"" + parentKey + "\"\\s*:\\s*\\{[^}]*\"" + childKey + "\"\\s*:\\s*(\\d+)";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(nestedPattern);
        java.util.regex.Matcher m = r.matcher(json);
        if (m.find()) {
            return Integer.parseInt(m.group(1));
        }
        return 0;
    }
    
    public static ATSScore createErrorScore(String errorMessage) {
        Map<String, Integer> defaultScores = new HashMap<>();
        defaultScores.put("format", 0);
        defaultScores.put("keywords", 0);
        defaultScores.put("achievements", 0);
        defaultScores.put("skills", 0);
        
        return ATSScore.builder()
                .score(0)
                .recommendation(errorMessage)
                .strengths(Collections.emptyList())
                .weaknesses(Collections.singletonList("Analysis error occurred"))
                .categoryScores(defaultScores)
                .build();
    }
}