package com.resume.analyzer.Controller;

import com.resume.analyzer.Model.AnalysisResult;
import com.resume.analyzer.Repository.AnalysisResultRepository;
import com.resume.analyzer.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stats")
public class StatsController {

    private final AnalysisResultRepository analysisResultRepository;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalProcessed = analysisResultRepository.count();
        Double avgScore = analysisResultRepository.getAverageScore();
        
        // Dynamic Active Engines: Number of unique roles analyzed
        long uniqueRoles = analysisResultRepository.findAll()
            .stream()
            .map(AnalysisResult::getPrimaryRole)
            .filter(java.util.Objects::nonNull)
            .distinct()
            .count();
        
        // Map recent results to a cleaner format with real timestamps
        List<Map<String, Object>> recentFeed = analysisResultRepository.findTop5ByOrderByAnalysisDateDesc()
            .stream()
            .map(res -> {
                Map<String, Object> item = new HashMap<>();
                item.put("name", res.getUser().getName() != null ? res.getUser().getName() : res.getUser().getUsername());
                item.put("role", res.getPrimaryRole());
                item.put("score", res.getOverallScore());
                item.put("timestamp", res.getAnalysisDate());
                return item;
            })
            .collect(Collectors.toList());

        stats.put("totalProcessed", totalProcessed);
        stats.put("averageScore", avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0);
        stats.put("activeEngines", uniqueRoles > 0 ? uniqueRoles : 1); // Minimum 1 engine (the base analyzer)
        stats.put("recentFeed", recentFeed);

        
        // Dynamic trend: Compare total average vs last 5 scans
        Double recentAvg = recentFeed.stream()
            .mapToDouble(m -> (int)m.get("score"))
            .average()
            .orElse(0.0);
        double trend = avgScore != null ? Math.round((recentAvg - avgScore) * 10.0) / 10.0 : 0.0;
        stats.put("trend", trend >= 0 ? "+" + trend : String.valueOf(trend));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/global-history")
    public ResponseEntity<List<Map<String, Object>>> getGlobalHistory() {
        return ResponseEntity.ok(
            analysisResultRepository.findAllByOrderByAnalysisDateDesc()
                .stream()
                .map(res -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", res.getUser().getName() != null ? res.getUser().getName() : res.getUser().getUsername());
                    item.put("role", res.getPrimaryRole());
                    item.put("score", res.getOverallScore());
                    item.put("date", res.getAnalysisDate());
                    return item;
                })
                .collect(Collectors.toList())
        );
    }
}

