package com.example.SL.Tech.Store.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(String to, String customerName, String orderId, double totalAmount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Order Confirmation - SL Tech Store #" + orderId);

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🛒 SL Tech Store</h1>
                        <p style="color: #bfdbfe; margin: 8px 0 0;">Order Confirmed!</p>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #1e40af; margin-top: 0;">Hi %s,</h2>
                        <p style="color: #334155;">Thank you for your order! We're processing it right away.</p>
                        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0; color: #1e40af;"><strong>Order ID:</strong> %s</p>
                            <p style="margin: 5px 0; color: #1e40af;"><strong>Total Amount:</strong> Rs. %.2f</p>
                        </div>
                        <p style="color: #64748b; font-size: 14px;">You can track your order status in your account dashboard.</p>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="color: #94a3b8; font-size: 12px; text-align: center;">© 2026 SL Tech Store. All rights reserved.</p>
                    </div>
                </div>
                """.formatted(customerName, orderId, totalAmount);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            // Log but don't throw — email failure shouldn't block order
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }
    }

    public void sendOrderStatusUpdate(String to, String customerName, String orderId, String status) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("Order Update - SL Tech Store #" + orderId);

            String htmlContent = """
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0;">SL Tech Store</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                        <h2 style="color: #1e40af;">Hi %s,</h2>
                        <p>Your order <strong>#%s</strong> status has been updated to: <strong style="color: #3b82f6;">%s</strong></p>
                    </div>
                </div>
                """.formatted(customerName, orderId, status);

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Failed to send order status email: " + e.getMessage());
        }
    }
}
