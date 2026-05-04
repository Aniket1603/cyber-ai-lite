package com.cybereye.backend.service;

import com.cybereye.backend.dto.ScanResponse;
import com.cybereye.backend.entity.*;
import com.cybereye.backend.repository.ScanResultRepository;
import com.cybereye.backend.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired private ScanResultRepository scanResultRepository;
    @Autowired private UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<ScanResponse> getHistory(String username, boolean isAdmin) {
        List<ScanResult> results;
        if (isAdmin) {
            results = scanResultRepository.findAllByOrderByCreatedAtDesc();
        } else {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            results = scanResultRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        }
        return results.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Map<String, Object> getStats(String username, boolean isAdmin) {
        Map<String, Object> stats = new HashMap<>();
        if (isAdmin) {
            long total = scanResultRepository.count();
            stats.put("totalScans", total);
            stats.put("totalThreats", scanResultRepository.countAllThreats());
            stats.put("urlScans",   countAllByType(ScanType.URL));
            stats.put("emailScans", countAllByType(ScanType.EMAIL));
            stats.put("imageScans", countAllByType(ScanType.IMAGE));
        } else {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Long uid = user.getId();
            stats.put("totalScans", scanResultRepository.countByUserId(uid));
            stats.put("totalThreats", scanResultRepository.countThreatsByUserId(uid));
            stats.put("urlScans", scanResultRepository.countByUserIdAndScanType(uid, ScanType.URL));
            stats.put("emailScans", scanResultRepository.countByUserIdAndScanType(uid, ScanType.EMAIL));
            stats.put("imageScans", scanResultRepository.countByUserIdAndScanType(uid, ScanType.IMAGE));
            stats.put("safeScans", scanResultRepository.countByUserIdAndThreatLevel(uid, ThreatLevel.SAFE));
        }
        return stats;
    }

    private long countAllByType(ScanType type) {
        return scanResultRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(s -> s.getScanType() == type).count();
    }

    private ScanResponse toResponse(ScanResult r) {
        Map<String, Object> details = new HashMap<>();
        try {
            if (r.getDetails() != null && !r.getDetails().isBlank()) {
                details = objectMapper.readValue(r.getDetails(), new TypeReference<>() {});
            }
        } catch (Exception ignored) {}

        return ScanResponse.builder()
                .id(r.getId())
                .scanType(r.getScanType())
                .input(r.getInput())
                .result(r.getResult())
                .threatLevel(r.getThreatLevel())
                .confidence(r.getConfidence())
                .details(details)
                .timestamp(r.getCreatedAt())
                .build();
    }
}
