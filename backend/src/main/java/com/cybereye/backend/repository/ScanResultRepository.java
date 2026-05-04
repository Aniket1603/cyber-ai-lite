package com.cybereye.backend.repository;

import com.cybereye.backend.entity.ScanResult;
import com.cybereye.backend.entity.ScanType;
import com.cybereye.backend.entity.ThreatLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScanResultRepository extends JpaRepository<ScanResult, Long> {

    List<ScanResult> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ScanResult> findAllByOrderByCreatedAtDesc();

    long countByUserId(Long userId);

    long countByUserIdAndThreatLevel(Long userId, ThreatLevel threatLevel);

    long countByUserIdAndScanType(Long userId, ScanType scanType);

    long countByScanType(ScanType scanType);

    @Query("SELECT COUNT(s) FROM ScanResult s WHERE s.threatLevel != 'SAFE'")
    long countAllThreats();

    @Query("SELECT COUNT(s) FROM ScanResult s WHERE s.user.id = :userId AND s.threatLevel != 'SAFE'")
    long countThreatsByUserId(@Param("userId") Long userId);
}
