package com.finlec.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private BigDecimal totalRevenue;
    private BigDecimal totalPending;
    private long paidInvoiceCount;
    private long unpaidInvoiceCount;
    private long overdueInvoiceCount;
    private long totalCustomers;
    private long totalProducts;
}
