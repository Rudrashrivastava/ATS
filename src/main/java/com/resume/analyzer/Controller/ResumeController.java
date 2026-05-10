package com.resume.analyzer.Controller;


import com.resume.analyzer.Model.ATSScore;
import com.resume.analyzer.Services.ATSScoreService;
import com.resume.analyzer.Services.PDFService;
import com.resume.analyzer.Services.RepoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/resume")
public class ResumeController {
    @Autowired
    private final PDFService pdfService;
    @Autowired
    private final ATSScoreService atsScoreService;
    @Autowired
    private final RepoService repoService;


    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ATSScore> analyzeResume(@RequestParam("file") MultipartFile file) {
        try {
            validateFile(file);
            String resumeText = pdfService.extractTextFromPDF(file);
            ATSScore score = atsScoreService.calculateScore(resumeText);
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
            return ResponseEntity.ok(score);
        } catch (IOException e) {
            log.error("Error processing PDF file", e);
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid file submission", e);
            return ResponseEntity.badRequest().build();
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