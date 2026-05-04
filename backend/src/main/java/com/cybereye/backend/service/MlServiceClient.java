package com.cybereye.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
public class MlServiceClient {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @SuppressWarnings("unchecked")
    public Map<String, Object> predictUrl(String url) {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("url", url);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlServiceUrl + "/predict/url", entity, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            return mockResponse("SAFE", "URL_MOCK", 72.0, "ML service unavailable – using fallback");
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> predictEmail(String text) {
        try {
            Map<String, String> body = new HashMap<>();
            body.put("text", text);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlServiceUrl + "/predict/email", entity, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            return mockResponse("LEGITIMATE", "EMAIL_MOCK", 65.0, "ML service unavailable – using fallback");
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> predictImage(MultipartFile file) throws IOException {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            byte[] bytes = file.getBytes();
            body.add("file", new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
                }
            });

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    mlServiceUrl + "/predict/image", entity, Map.class);
            return response.getBody();
        } catch (RestClientException e) {
            return mockResponse("REAL", "IMAGE_MOCK", 58.0, "ML service unavailable – using fallback");
        }
    }

    private Map<String, Object> mockResponse(String result, String type, double confidence, String details) {
        Map<String, Object> mock = new HashMap<>();
        mock.put("result", result);
        mock.put("confidence", confidence);
        mock.put("threat_level", "SAFE");
        mock.put("details", details);
        mock.put("model", "fallback_mock");
        return mock;
    }
}
