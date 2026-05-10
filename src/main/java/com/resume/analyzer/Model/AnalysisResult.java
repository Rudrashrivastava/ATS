package com.resume.analyzer.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "analysis_results")
public class AnalysisResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private int overallScore;
    
    @Column(columnDefinition = "TEXT")
    private String recommendation;
    
    private String primaryRole;
    
    // AI GENERATED CAREER DNA (STORED AS JSON)
    @Column(columnDefinition = "TEXT")
    private String trajectoryJson;
    
    @Column(columnDefinition = "TEXT")
    private String opportunitiesJson;
    
    private LocalDateTime analysisDate;

    @PrePersist
    protected void onCreate() {
        analysisDate = LocalDateTime.now();
    }
}
