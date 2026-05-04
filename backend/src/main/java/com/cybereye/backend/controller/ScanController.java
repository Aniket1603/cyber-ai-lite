package com.cybereye.backend.controller;

import com.cybereye.backend.dto.ScanResponse;
import com.cybereye.backend.service.ScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/scan")
public class ScanController {

    @Autowired
    private ScanService scanService;

    @PostMapping("/url")
    public ResponseEntity<?> scanUrl(@RequestBody Map<String, String> body, Authentication auth) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "URL is required"));
        }
        try {
            ScanResponse response = scanService.scanUrl(url.trim(), auth.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/email")
    public ResponseEntity<?> scanEmail(@RequestBody Map<String, String> body, Authentication auth) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email text is required"));
        }
        try {
            ScanResponse response = scanService.scanEmail(text.trim(), auth.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/image")
    public ResponseEntity<?> scanImage(@RequestParam("file") MultipartFile file, Authentication auth) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image file is required"));
        }
        try {
            ScanResponse response = scanService.scanImage(file, auth.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
