package com.resume.analyzer.Controller;

import com.resume.analyzer.Services.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService geminiService;

    @PostMapping("/query")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        String response = geminiService.getChatResponse(userQuery);
        
        Map<String, String> result = new HashMap<>();
        result.put("response", response);
        return ResponseEntity.ok(result);
    }
}
