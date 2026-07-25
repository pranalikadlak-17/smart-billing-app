package com.finlec.billing.controller;

import com.finlec.billing.dto.DashboardResponse;
import com.finlec.billing.dto.InvoiceRequest;
import com.finlec.billing.entity.Invoice;
import com.finlec.billing.entity.InvoiceStatus;
import com.finlec.billing.service.AiInsightService;
import com.finlec.billing.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final AiInsightService aiInsightService;

    @GetMapping
    public ResponseEntity<List<Invoice>> getAll() {
        return ResponseEntity.ok(invoiceService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Invoice>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(invoiceService.getByCustomer(customerId));
    }

    @PostMapping
    public ResponseEntity<Invoice> create(@Valid @RequestBody InvoiceRequest request) {
        Invoice saved = invoiceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        InvoiceStatus status = InvoiceStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(invoiceService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        invoiceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(invoiceService.getDashboard());
    }

    @GetMapping("/{id}/ai-summary")
    public ResponseEntity<Map<String, String>> getAiSummary(@PathVariable Long id) {
        Invoice invoice = invoiceService.getById(id);
        String summary = aiInsightService.generateInvoiceSummary(invoice);
        return ResponseEntity.ok(Map.of("summary", summary));
    }
}
