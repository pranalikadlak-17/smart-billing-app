package com.finlec.billing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finlec.billing.entity.Invoice;
import com.finlec.billing.entity.InvoiceItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Uses Google Gemini to generate a short, human-readable summary/note for an invoice.
 * This is the "AI Integration" bonus feature for the assessment.
 * If no API key is configured, falls back to a simple templated summary so the
 * feature degrades gracefully instead of breaking the app.
 */
@Service
public class AiInsightService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateInvoiceSummary(Invoice invoice) {
        if (apiKey == null || apiKey.isBlank()) {
            return fallbackSummary(invoice);
        }

        try {
            StringBuilder itemsDescription = new StringBuilder();
            for (InvoiceItem item : invoice.getItems()) {
                itemsDescription.append(item.getQuantity())
                        .append(" x ")
                        .append(item.getProduct().getName())
                        .append(", ");
            }

            String prompt = "Write a short, friendly one-paragraph billing note (max 40 words) for a customer "
                    + "summarizing this invoice. Items: " + itemsDescription
                    + " Total amount: " + invoice.getTotalAmount()
                    + ". Do not include any greeting or sign-off, just the note.";

            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> content = new HashMap<>();
            content.put("parts", new Object[]{Map.of("text", prompt)});
            requestBody.put("contents", new Object[]{content});

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = apiUrl + "?key=" + apiKey;
            String response = restTemplate.postForObject(url, entity, String.class);

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText().trim();

        } catch (Exception e) {
            return fallbackSummary(invoice);
        }
    }

    private String fallbackSummary(Invoice invoice) {
        return "Invoice " + invoice.getInvoiceNumber() + " includes " + invoice.getItems().size()
                + " item(s) totaling ₹" + invoice.getTotalAmount()
                + ". Payment is due by " + invoice.getDueDate() + ".";
    }
}
