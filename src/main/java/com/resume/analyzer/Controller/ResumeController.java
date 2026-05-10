package com.resume.analyzer.Controller;


import com.resume.analyzer.Model.ATSScore;
import com.resume.analyzer.Model.AnalysisResult;
import com.resume.analyzer.Model.User;
import com.resume.analyzer.Repository.AnalysisResultRepository;
import com.resume.analyzer.Repository.UserRepository;
import com.resume.analyzer.Services.ATSScoreService;
import com.resume.analyzer.Services.PDFService;
import com.resume.analyzer.Services.RepoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resume")
public class ResumeController {
    @Autowired
    private final PDFService pdfService;
    @Autowired
    private final ATSScoreService atsScoreService;
    private final RepoService repoService;
    private final AnalysisResultRepository analysisResultRepository;
    private final UserRepository userRepository;


    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ATSScore> analyzeResume(@RequestParam("file") MultipartFile file) {
        try {
            validateFile(file);
            String resumeText = pdfService.extractTextFromPDF(file);
            ATSScore score = atsScoreService.calculateScore(resumeText);
            saveResult(score);
            return ResponseEntity.ok(score);
        } catch (IOException e) {
            log.error("Error processing PDF file", e);
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid file submission", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(value = "/analyze-with-job", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ATSScore> analyzeResumeWithJobDescription(
            @RequestParam("file") MultipartFile file,
            @RequestParam("jobDescription") String jobDescription) {
        try {
            validateFile(file);
            String resumeText = pdfService.extractTextFromPDF(file);
            ATSScore score = atsScoreService.calculateScore(resumeText, jobDescription);
            saveResult(score);
            return ResponseEntity.ok(score);
        } catch (IOException e) {
            log.error("Error processing PDF file", e);
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid file submission", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<AnalysisResult>> getHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            return ResponseEntity.ok(analysisResultRepository.findByUserOrderByAnalysisDateDesc(user.get()));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/global-history")
    public ResponseEntity<List<AnalysisResult>> getGlobalHistory() {
        List<AnalysisResult> history = analysisResultRepository.findTop5ByOrderByAnalysisDateDesc();
        if (history.isEmpty()) {
            log.info("Date-based history empty, using ID fallback");
            history = analysisResultRepository.findTop5ByOrderByIdDesc();
        }
        return ResponseEntity.ok(history);
    }

    @GetMapping("/all-history")
    public ResponseEntity<List<AnalysisResult>> getAllHistory() {
        return ResponseEntity.ok(analysisResultRepository.findAllByOrderByAnalysisDateDesc());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long total = analysisResultRepository.count();
        Double avg = analysisResultRepository.getAverageScore();
        long uniqueRoles = analysisResultRepository.countUniqueRoles();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProcessed", total);
        stats.put("avgMatch", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        stats.put("activeEngines", uniqueRoles);
        
        return ResponseEntity.ok(stats);
    }

    private void saveResult(ATSScore score) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> user = userRepository.findByUsername(username);
            if (user.isPresent() && score.getScore() > 0) {
                AnalysisResult result = AnalysisResult.builder()
                        .user(user.get())
                        .overallScore(score.getScore())
                        .recommendation(score.getRecommendation())
                        .primaryRole(score.getMarketSearchQuery())
                        .build();
                analysisResultRepository.save(result);
            }
        } catch (Exception e) {
            log.error("Failed to save", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty() || !file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF supported");
        }
    }
}