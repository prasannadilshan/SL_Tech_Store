package com.example.SL.Tech.Store.controller;

import com.example.SL.Tech.Store.dto.ApiResponse;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostMapping("/create-intent")
    public ResponseEntity<ApiResponse<Map<String, String>>> createPaymentIntent(@RequestBody Map<String, Object> data) {
        Stripe.apiKey = stripeApiKey;

        try {
            // Amount is expected in full rupees. Stripe expects amount in the smallest currency unit (cents/cents equivalent).
            // For LKR, the smallest unit is cents (1 LKR = 100 cents).
            Object amountObj = data.get("amount");
            long amount = 0;
            if (amountObj instanceof Integer) {
                amount = ((Integer) amountObj).longValue() * 100;
            } else if (amountObj instanceof Double) {
                amount = (long) (((Double) amountObj) * 100);
            } else if (amountObj instanceof String) {
                amount = Long.parseLong((String) amountObj) * 100;
            } else {
                throw new IllegalArgumentException("Invalid amount format");
            }

            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setAmount(amount)
                            .setCurrency("lkr")
                            // In the latest API version, automatic_payment_methods is enabled by default.
                            .setAutomaticPaymentMethods(
                                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                            .setEnabled(true)
                                            .build()
                            )
                            .build();

            PaymentIntent intent = PaymentIntent.create(params);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("clientSecret", intent.getClientSecret());

            return ResponseEntity.ok(ApiResponse.success(responseData));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
