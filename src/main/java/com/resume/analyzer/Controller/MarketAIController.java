package com.resume.analyzer.Controller;

import com.resume.analyzer.Services.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/market")
public class MarketAIController {

    private final GeminiService geminiService;

    @PostMapping("/recommendations")
    public ResponseEntity<String> getAIRecommendations(@RequestBody Map<String, Object> analysisData) {
        String prompt = "Act as a career API. Based on this resume analysis: " + analysisData.toString() + 
            "\nSuggest 3 specific job titles that fit this person's current skills." +
            "\nAlso provide a line-by-line 'Future Growth Roadmap' (max 5 lines) on what they should learn next to increase their match score." +
            "\nOUTPUT ONLY A PURE JSON OBJECT with keys: 'jobs' (list of strings) and 'roadmap' (list of strings). DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN.";
            
        String response = geminiService.getChatResponse(prompt);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<String> evaluateMarketMatches(@RequestBody Map<String, Object> payload) {
        Object marketJobs = payload.get("marketJobs");
        Object analysisData = payload.get("analysisData");

        String prompt = "ROBOTIC CAREER ARCHITECT v4.9 (GAP-AWARE ENGINE). \n" +
            "CONTEXT: " + (analysisData != null ? analysisData.toString() : "{}") + "\n" +
            "MISSION: Perform a DEEP GAP ANALYSIS between the User's Resume and the Target JD.\n" +
            "1. 'strategy': Generate a LONG-FORM (300+ words) theoretical deep-dive analyzing the specific skill gaps and bridge-strategy. \n" +
            "2. 'roadmap': 7 precise career steps to bridge the gap.\n" +
            "3. 'projects': 3 specific technical projects to build missing skills {title, architecture, setupCommands}.\n" +
            "4. 'resources': 5 high-authority clickable technical URLs (e.g. documentation, courses) to learn missing tech.\n" +
            "5. 'salary': Dual benchmarking {low, average, high}.\n" +
            "6. 'dossier': Massive 3-page technical markdown for PDF.\n" +
            "RULE: ONLY VALID JSON. NO MARKDOWN. ESCAPE QUOTES.";

        String response = geminiService.getChatResponse(prompt);
        return ResponseEntity.ok(response);
    }
}
