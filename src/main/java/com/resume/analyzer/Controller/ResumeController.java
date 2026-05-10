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

    private void saveResult(ATSScore score) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<User> user = userRepository.findByUsername(username);
            if (user.isPresent()) {
                AnalysisResult result = AnalysisResult.builder()
                        .user(user.get())
                        .overallScore(score.getScore())
                        .recommendation(score.getRecommendation())
                        .primaryRole(score.getMarketSearchQuery())
                        .build();
                analysisResultRepository.save(result);
                log.info("Saved analysis result for user: {}", username);
            }
        } catch (Exception e) {
            log.error("Failed to save analysis result", e);
        }
    }


    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are supported");
        }
    }
}