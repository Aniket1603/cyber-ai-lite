package com.cybereye.backend.controller;

import com.cybereye.backend.dto.ScanResponse;
import com.cybereye.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/history")
    public ResponseEntity<List<ScanResponse>> getHistory(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        List<ScanResponse> history = reportService.getHistory(auth.getName(), isAdmin);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
        Map<String, Object> stats = reportService.getStats(auth.getName(), isAdmin);
        return ResponseEntity.ok(stats);
    }
}
