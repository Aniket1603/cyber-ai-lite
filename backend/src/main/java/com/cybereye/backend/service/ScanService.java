package com.cybereye.backend.service;

import com.cybereye.backend.dto.ScanResponse;
import com.cybereye.backend.entity.*;
import com.cybereye.backend.repository.ScanResultRepository;
import com.cybereye.backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class ScanService {

    @Autowired private MlServiceClient mlClient;
    @Autowired private ScanResultRepository scanResultRepository;
    @Autowired private UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ScanResponse scanUrl(String url, String username) {
        Map<String, Object> mlResult = mlClient.predictUrl(url);
        return saveScan(username, ScanType.URL, url, mlResult);
    }

    public ScanResponse scanEmail(String text, String username) {
        Map<String, Object> mlResult = mlClient.predictEmail(text);
        return saveScan(username, ScanType.EMAIL, text.length() > 200 ? text.substring(0, 200) + "..." : text, mlResult);
    }

    public ScanResponse scanImage(MultipartFile file, String username) throws IOException {
        Map<String, Object> mlResult = mlClient.predictImage(file);
        String inputRef = "Image: " + (file.getOriginalFilename() != null ? file.getOriginalFilename() : "uploaded_image");
        return saveScan(username, ScanType.IMAGE, inputRef, mlResult);
    }

    @SuppressWarnings("unchecked")
    private ScanResponse saveScan(String username, ScanType scanType, String input, Map<String, Object> mlResult) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String result = getString(mlResult, "result", "UNKNOWN");
        double confidence = getDouble(mlResult, "confidence", 50.0);
        String threatLevelStr = getString(mlResult, "threat_level", "SAFE");
        ThreatLevel threatLevel;
        try {
            threatLevel = ThreatLevel.valueOf(threatLevelStr.toUpperCase());
        } catch (Exception e) {
            threatLevel = ThreatLevel.SAFE;
        }

        // Serialize all ML metadata (features, analysis, model, etc.)
        String detailsJson;
        try {
            detailsJson = objectMapper.writeValueAsString(mlResult);
        } catch (Exception e) {
            detailsJson = "{}";
        }

        ScanResult scanResult = ScanResult.builder()
                .user(user)
                .scanType(scanType)
                .input(input)
                .result(result)
                .threatLevel(threatLevel)
                .confidence(confidence)
                .details(detailsJson)
                .build();

        ScanResult saved = scanResultRepository.save(scanResult);

        return ScanResponse.builder()
                .id(saved.getId())
                .scanType(scanType)
                .input(input)
                .result(result)
                .threatLevel(threatLevel)
                .confidence(confidence)
                .details(mlResult)
                .timestamp(saved.getCreatedAt())
                .model(getString(mlResult, "model", "unknown"))
                .build();
    }

    private String getString(Map<String, Object> map, String key, String def) {
        Object val = map.get(key);
        return val != null ? val.toString() : def;
    }

    private double getDouble(Map<String, Object> map, String key, double def) {
        Object val = map.get(key);
        if (val instanceof Number) return ((Number) val).doubleValue();
        return def;
    }
}
