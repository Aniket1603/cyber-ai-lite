package com.cybereye.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.cybereye.backend.service.MlServiceClient;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @Autowired
    private MlServiceClient mlClient;

    @GetMapping("/api/health")
    public ResponseEntity<?> health() {
        Map<String, Object> status = new HashMap<>();
        status.put("backend", "UP");
        
        // ML service check (simple ping)
        try {
            mlClient.predictUrl("https://google.com");
            status.put("mlService", "UP");
        } catch (Exception e) {
            status.put("mlService", "DOWN");
        }
        
        return ResponseEntity.ok(status);
    }
}
