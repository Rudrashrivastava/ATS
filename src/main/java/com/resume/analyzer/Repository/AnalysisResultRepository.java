package com.resume.analyzer.Repository;

import com.resume.analyzer.Model.AnalysisResult;
import com.resume.analyzer.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AnalysisResultRepository extends JpaRepository<AnalysisResult, Long> {
    List<AnalysisResult> findByUserOrderByAnalysisDateDesc(User user);
    
    List<AnalysisResult> findTop5ByOrderByAnalysisDateDesc();
    
    List<AnalysisResult> findTop5ByOrderByIdDesc();

    List<AnalysisResult> findTop8ByOrderByIdDesc();
    
    List<AnalysisResult> findAllByOrderByAnalysisDateDesc();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(DISTINCT a.primaryRole) FROM AnalysisResult a")
    long countUniqueRoles();

    @org.springframework.data.jpa.repository.Query("SELECT AVG(a.overallScore) FROM AnalysisResult a")
    Double getAverageScore();
}

