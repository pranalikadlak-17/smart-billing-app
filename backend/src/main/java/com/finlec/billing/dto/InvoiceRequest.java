package com.finlec.billing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {

    @NotNull(message = "Customer id is required")
    private Long customerId;

    @NotEmpty(message = "Invoice must have at least one item")
    private List<@Valid InvoiceItemRequest> items;

    private BigDecimal discountPercent = BigDecimal.ZERO;

    private LocalDate dueDate;

    private String notes;
}
