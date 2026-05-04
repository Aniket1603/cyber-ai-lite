package com.cybereye.backend.dto;

import com.cybereye.backend.entity.ScanType;
import com.cybereye.backend.entity.ThreatLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScanResponse {
    private Long id;
    private ScanType scanType;
    private String input;
    private String result;
    private ThreatLevel threatLevel;
    private Double confidence;
    private Map<String, Object> details;
    private LocalDateTime timestamp;
    private String model;
}
