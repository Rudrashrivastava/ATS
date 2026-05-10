package com.resume.analyzer.Controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
public class JobProxyController {

    @Value("${rapidapi.key}")
    private String rapidApiKey;

    @Value("${rapidapi.host}")
    private String rapidApiHost;

    @Value("${openwebninja.api-key}")
    private String openWebNinjaKey;

    @Value("${openwebninja.base-url}")
    private String openWebNinjaUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/api/jobs/suggestions")
    public ResponseEntity<?> getJobSuggestions(@RequestParam String query, @RequestParam(required = false, defaultValue = "de") String countryCode) {
        String url = String.format("https://%s/v2/salary/range?query=%s&countryCode=%s", rapidApiHost, query, countryCode);
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-rapidapi-key", rapidApiKey);
        headers.set("x-rapidapi-host", rapidApiHost);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of("error", "Failed to fetch job suggestions", "details", e.getMessage()));
        }
    }

    @GetMapping("/api/jobs/companies")
    public ResponseEntity<?> searchCompanies(@RequestParam String query) {
        try {
            // Encode query to handle spaces and special characters
            String encodedQuery = java.net.URLEncoder.encode(query, "UTF-8");
            String url = openWebNinjaUrl + "?query=" + encodedQuery;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-api-key", openWebNinjaKey);
            // Add User-Agent to avoid being blocked as a bot
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(502).body(Map.of(
                "error", "Market synchronization node failed", 
                "details", e.getMessage(),
                "status", "502"
            ));
        }
    }

}
