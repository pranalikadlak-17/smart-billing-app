package com.finlec.billing.service;

import com.finlec.billing.dto.DashboardResponse;
import com.finlec.billing.dto.InvoiceItemRequest;
import com.finlec.billing.dto.InvoiceRequest;
import com.finlec.billing.entity.*;
import com.finlec.billing.exception.ResourceNotFoundException;
import com.finlec.billing.repository.CustomerRepository;
import com.finlec.billing.repository.InvoiceRepository;
import com.finlec.billing.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    private static final int SCALE = 2;

    public List<Invoice> getAll() {
        return invoiceRepository.findAll();
    }

    public Invoice getById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    public List<Invoice> getByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Invoice create(InvoiceRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with id: " + request.getCustomerId()));

        Invoice invoice = new Invoice();
        invoice.setCustomer(customer);
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setDueDate(request.getDueDate() != null ? request.getDueDate() : LocalDate.now().plusDays(15));
        invoice.setNotes(request.getNotes());
        invoice.setDiscountPercent(request.getDiscountPercent() != null
                ? request.getDiscountPercent() : BigDecimal.ZERO);

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;

        for (InvoiceItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found with id: " + itemReq.getProductId()));

            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero for product: " + product.getName());
            }

            BigDecimal lineBase = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            BigDecimal lineTax = lineBase
                    .multiply(product.getTaxPercent() != null ? product.getTaxPercent() : BigDecimal.ZERO)
                    .divide(BigDecimal.valueOf(100), SCALE, RoundingMode.HALF_UP);
            BigDecimal lineTotal = lineBase.add(lineTax).setScale(SCALE, RoundingMode.HALF_UP);

            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.setTaxPercent(product.getTaxPercent());
            item.setLineTotal(lineTotal);
            invoice.getItems().add(item);

            subtotal = subtotal.add(lineBase);
            taxTotal = taxTotal.add(lineTax);
        }

        BigDecimal discountAmount = subtotal
                .multiply(invoice.getDiscountPercent())
                .divide(BigDecimal.valueOf(100), SCALE, RoundingMode.HALF_UP);

        BigDecimal total = subtotal.add(taxTotal).subtract(discountAmount).setScale(SCALE, RoundingMode.HALF_UP);

        invoice.setSubtotal(subtotal.setScale(SCALE, RoundingMode.HALF_UP));
        invoice.setTaxAmount(taxTotal.setScale(SCALE, RoundingMode.HALF_UP));
        invoice.setDiscountAmount(discountAmount);
        invoice.setTotalAmount(total);
        invoice.setStatus(InvoiceStatus.UNPAID);

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice updateStatus(Long id, InvoiceStatus status) {
        Invoice invoice = getById(id);
        invoice.setStatus(status);
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void delete(Long id) {
        Invoice invoice = getById(id);
        invoiceRepository.delete(invoice);
    }

    public DashboardResponse getDashboard() {
        return new DashboardResponse(
                invoiceRepository.getTotalRevenue(),
                invoiceRepository.getTotalPending(),
                invoiceRepository.countByStatus(InvoiceStatus.PAID),
                invoiceRepository.countByStatus(InvoiceStatus.UNPAID),
                invoiceRepository.countByStatus(InvoiceStatus.OVERDUE),
                customerRepository.count(),
                productRepository.count()
        );
    }

    private String generateInvoiceNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = invoiceRepository.count() + 1;
        return "INV-" + datePart + "-" + String.format("%04d", count);
    }
}
