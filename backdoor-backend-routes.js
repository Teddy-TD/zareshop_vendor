/**
 * Vendor Registration Payment Routes
 * 
 * This file defines all API routes for vendor registration payment system,
 * including payment creation, status updates, admin verification, and mobile app integration.
 * 
 * Route Structure:
 * - /api/vendor-registration/payment - Payment management
 * - /api/admin/vendor-payments - Admin payment management
 * - /api/mobile/vendor-registration/payment - Mobile app endpoints
 */

const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');

// Import controllers
const vendorRegistrationPaymentController = require('../controllers/vendor_registration_payment.controller');

// Import middleware from ZARE backend
const { authenticate, authorizeAdmin, authorizeVendor } = require('../middlewares/authMiddleware');
const paymentValidation = require('../middlewares/vendor_registration_payment.validation.middleware');

/**
 * Payment Management Routes
 * Base path: /api/vendor-registration/payment
 */

// Create new payment
router.post('/payment',
  paymentValidation.validateCreatePayment,
  paymentValidation.validatePaymentMethodProvider,
  paymentValidation.validateCurrency,
  vendorRegistrationPaymentController.createPayment
);

// Get payment by ID
router.get('/payment/:id',
  paymentValidation.validatePaymentId,
  vendorRegistrationPaymentController.getPaymentById
);

// Update payment status
router.put('/payment/:id/status',
  paymentValidation.validatePaymentId,
  paymentValidation.validateUpdatePaymentStatus,
  paymentValidation.validatePaymentReference,
  vendorRegistrationPaymentController.updatePaymentStatus
);

// Process integrated payment
router.post('/payment/:id/process',
  paymentValidation.validatePaymentId,
  paymentValidation.validateProcessIntegratedPayment,
  vendorRegistrationPaymentController.processIntegratedPayment
);

// Upload payment proof for manual payment
router.post('/payment/:id/proof',
  paymentValidation.validatePaymentId,
  paymentValidation.validateUploadPaymentProof,
  vendorRegistrationPaymentController.uploadPaymentProof
);

/**
 * Admin Management Routes
 * Base path: /api/admin/vendor-payments
 * All admin routes require authentication and admin privileges
 */

// Get all payments with filters (Admin only)
router.get('/admin/vendor-payments',
  authenticate,
  authorizeAdmin,
  vendorRegistrationPaymentController.getPaymentsWithFilters
);

// Get pending manual payments (Admin only)
router.get('/admin/vendor-payments/pending',
  authenticate,
  authorizeAdmin,
  vendorRegistrationPaymentController.getPendingPayments
);

// Verify manual payment (Admin only)
router.post('/admin/vendor-payments/:id/verify',
  authenticate,
  authorizeAdmin,
  paymentValidation.validatePaymentId,
  paymentValidation.validateVerifyManualPayment,
  paymentValidation.validateAdminPaymentPermissions,
  vendorRegistrationPaymentController.verifyManualPayment
);

// Get payment statistics (Admin only)
router.get('/admin/vendor-payments/statistics',
  authenticate,
  authorizeAdmin,
  vendorRegistrationPaymentController.getPaymentStatistics
);

/**
 * Mobile App Routes
 * Base path: /api/mobile/vendor-registration/payment
 * All mobile routes require user authentication
 */

// Create mobile payment
router.post('/mobile/vendor-registration/payment',
  authenticate,
  paymentValidation.validateMobileAppRequirements,
  paymentValidation.validateCreateMobilePayment,
  paymentValidation.validatePaymentMethodProvider,
  paymentValidation.validateCurrency,
  vendorRegistrationPaymentController.createMobilePayment
);

// Capture payment proof (Mobile)
router.post('/mobile/vendor-registration/payment/:id/capture',
  authenticate,
  paymentValidation.validatePaymentId,
  paymentValidation.validateUploadPaymentProof,
  vendorRegistrationPaymentController.capturePaymentProof
);

// Generate payment QR code (Mobile)
router.get('/mobile/vendor-registration/payment/:id/qr',
  authenticate,
  paymentValidation.validatePaymentId,
  vendorRegistrationPaymentController.generatePaymentQRCode
);

/**
 * Webhook Routes for Payment Gateways
 * Base path: /api/vendor-registration/payment/webhook
 */

// Stripe webhook
router.post('/payment/webhook/stripe',
  // Note: Stripe webhook signature verification should be added here
  vendorRegistrationPaymentController.processStripeWebhook
);

// Chapa webhook
router.post('/payment/webhook/chapa',
  // Note: Chapa webhook signature verification should be added here
  vendorRegistrationPaymentController.processChapaWebhook
);

// PayPal webhook
router.post('/payment/webhook/paypal',
  // Note: PayPal webhook signature verification should be added here
  vendorRegistrationPaymentController.processPayPalWebhook
);

/**
 * Additional Utility Routes
 */

// Health check route (no database dependency)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Vendor registration payment routes are working',
    timestamp: new Date().toISOString()
  });
});

// Get payment instructions for manual payments
router.get('/payment/instructions/:provider',
  paymentValidation.validatePaymentProvider,
  paymentValidation.validatePaymentInstructions,
  vendorRegistrationPaymentController.getPaymentInstructions
);

// Get available subscription plans
router.get('/subscriptions/available',
  vendorRegistrationPaymentController.getAvailableSubscriptions
);

// Get subscription details
router.get('/subscriptions/:id/details',
  paymentValidation.validateSubscriptionId,
  vendorRegistrationPaymentController.getSubscriptionDetails
);

module.exports = router;
