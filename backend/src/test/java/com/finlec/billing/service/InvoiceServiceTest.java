package com.finlec.billing.service;

import com.finlec.billing.dto.InvoiceItemRequest;
import com.finlec.billing.dto.InvoiceRequest;
import com.finlec.billing.entity.Customer;
import com.finlec.billing.entity.Invoice;
import com.finlec.billing.entity.Product;
import com.finlec.billing.repository.CustomerRepository;
import com.finlec.billing.repository.InvoiceRepository;
import com.finlec.billing.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    private Customer customer;
    private Product product;

    @BeforeEach
    void setUp() {
        customer = new Customer();
        customer.setId(1L);
        customer.setName("Test Customer");

        product = new Product();
        product.setId(1L);
        product.setName("Web Hosting");
        product.setPrice(new BigDecimal("1000.00"));
        product.setTaxPercent(new BigDecimal("18.00")); // 18% GST
    }

    @Test
    void calculatesSubtotalTaxAndTotalCorrectly() {
        InvoiceItemRequest itemRequest = new InvoiceItemRequest();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(2); // 2 x 1000 = 2000 subtotal

        InvoiceRequest request = new InvoiceRequest();
        request.setCustomerId(1L);
        request.setItems(List.of(itemRequest));
        request.setDiscountPercent(BigDecimal.TEN); // 10% discount

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(invoiceRepository.count()).thenReturn(0L);
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        Invoice result = invoiceService.create(request);

        // subtotal = 1000 * 2 = 2000
        assertEquals(new BigDecimal("2000.00"), result.getSubtotal());
        // tax = 18% of 2000 = 360
        assertEquals(new BigDecimal("360.00"), result.getTaxAmount());
        // discount = 10% of 2000 = 200
        assertEquals(new BigDecimal("200.00"), result.getDiscountAmount());
        // total = 2000 + 360 - 200 = 2160
        assertEquals(new BigDecimal("2160.00"), result.getTotalAmount());
    }

    @Test
    void rejectsInvalidQuantity() {
        InvoiceItemRequest itemRequest = new InvoiceItemRequest();
        itemRequest.setProductId(1L);
        itemRequest.setQuantity(0);

        InvoiceRequest request = new InvoiceRequest();
        request.setCustomerId(1L);
        request.setItems(List.of(itemRequest));

        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        try {
            invoiceService.create(request);
            assertEquals(true, false, "Expected IllegalArgumentException was not thrown");
        } catch (IllegalArgumentException ex) {
            assertEquals("Quantity must be greater than zero for product: Web Hosting", ex.getMessage());
        }
    }
}
