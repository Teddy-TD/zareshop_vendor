/**
 * Vendor Registration Payment Controller
 * 
 * This controller handles all HTTP requests related to vendor registration payments,
 * including payment creation, status updates, admin verification, and mobile app integration.
 * 
 * Features:
 * - Create payment requests
 * - Process integrated payments
 * - Handle manual payment proof uploads
 * - Admin payment verification
 * - Mobile app payment endpoints
 * - Payment analytics and reporting
 */

const { validationResult } = require('express-validator');

// Import service with error handling
let vendorRegistrationPaymentService;
try {
  vendorRegistrationPaymentService = require('../services/vendor_registration_payment.service');
  console.log('Service imported successfully');
} catch (error) {
  console.error('Error importing service:', error.message);
  vendorRegistrationPaymentService = {};
}

/**
 * Create a new vendor registration payment
 * POST /api/vendor-registration/payment
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createPayment(req, res) {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { user_id, subscription_id, payment_method, payment_provider, currency } = req.body;

    // Create payment record
    const payment = await vendorRegistrationPaymentService.createRegistrationPayment({
      user_id,
      subscription_id,
      payment_method,
      payment_provider,
      currency
    });

    // Generate payment instructions for manual payments
    let paymentInstructions = null;
    if (payment_method === 'manual') {
      paymentInstructions = vendorRegistrationPaymentService.generatePaymentInstructions(
        payment_provider,
        payment.payment_reference,
        payment.amount
      );
    }

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: {
        payment,
        paymentInstructions
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
}

/**
 * Get payment details by ID
 * GET /api/vendor-registration/payment/:id
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPaymentById(req, res) {
  try {
    const { id } = req.params;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    const payment = await vendorRegistrationPaymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error getting payment by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment details',
      error: error.message
    });
  }
}

/**
 * Update payment status
 * PUT /api/vendor-registration/payment/:id/status
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, external_payment_id, payment_reference } = req.body;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    const updateData = {};
    if (external_payment_id) updateData.external_payment_id = external_payment_id;
    if (payment_reference) updateData.payment_reference = payment_reference;

    const payment = await vendorRegistrationPaymentService.updatePaymentStatus(
      paymentId,
      status,
      updateData
    );

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
}

/**
 * Process integrated payment
 * POST /api/vendor-registration/payment/:id/process
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function processIntegratedPayment(req, res) {
  try {
    const { id } = req.params;
    const { external_payment_id, payment_reference } = req.body;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    const payment = await vendorRegistrationPaymentService.processIntegratedPayment(
      paymentId,
      {
        external_payment_id,
        payment_reference
      }
    );

    res.json({
      success: true,
      message: 'Integrated payment processed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error processing integrated payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process integrated payment',
      error: error.message
    });
  }
}

/**
 * Upload payment proof for manual payment
 * POST /api/vendor-registration/payment/:id/proof
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function uploadPaymentProof(req, res) {
  try {
    const { id } = req.params;
    const { image_id } = req.body;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    if (!image_id) {
      return res.status(400).json({
        success: false,
        message: 'Image ID is required'
      });
    }

    const payment = await vendorRegistrationPaymentService.uploadPaymentProof(
      paymentId,
      parseInt(image_id)
    );

    res.json({
      success: true,
      message: 'Payment proof uploaded successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment proof',
      error: error.message
    });
  }
}

/**
 * Admin verify manual payment
 * POST /api/vendor-registration/payment/:id/verify
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function verifyManualPayment(req, res) {
  try {
    const { id } = req.params;
    const { approved, admin_notes } = req.body;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    if (typeof approved !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Approved field must be a boolean'
      });
    }

    // Get admin ID from authenticated user (assuming middleware sets req.user)
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    const payment = await vendorRegistrationPaymentService.verifyManualPayment(
      paymentId,
      adminId,
      approved,
      admin_notes
    );

    res.json({
      success: true,
      message: `Payment ${approved ? 'approved' : 'rejected'} successfully`,
      data: payment
    });
  } catch (error) {
    console.error('Error verifying manual payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify manual payment',
      error: error.message
    });
  }
}

/**
 * Get payments with filters (Admin endpoint)
 * GET /api/admin/vendor-payments
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPaymentsWithFilters(req, res) {
  try {
    const {
      status,
      payment_method,
      payment_provider,
      start_date,
      end_date,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      status,
      payment_method,
      payment_provider,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await vendorRegistrationPaymentService.getPaymentsWithFilters(filters);

    res.json({
      success: true,
      data: result.payments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting payments with filters:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payments',
      error: error.message
    });
  }
}

/**
 * Get pending manual payments (Admin endpoint)
 * GET /api/admin/vendor-payments/pending
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPendingPayments(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;

    const filters = {
      status: 'pending',
      payment_method: 'manual',
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await vendorRegistrationPaymentService.getPaymentsWithFilters(filters);

    res.json({
      success: true,
      data: result.payments,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error getting pending payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending payments',
      error: error.message
    });
  }
}

/**
 * Get payment statistics (Admin endpoint)
 * GET /api/admin/vendor-payments/statistics
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPaymentStatistics(req, res) {
  try {
    const statistics = await vendorRegistrationPaymentService.getPaymentStatistics();

    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting payment statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment statistics',
      error: error.message
    });
  }
}

/**
 * Mobile app payment creation endpoint
 * POST /api/mobile/vendor-registration/payment
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createMobilePayment(req, res) {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { subscription_id, payment_method, payment_provider, currency } = req.body;
    
    // Get user ID from authenticated user (assuming middleware sets req.user)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // Create payment record
    const payment = await vendorRegistrationPaymentService.createRegistrationPayment({
      user_id: userId,
      subscription_id,
      payment_method,
      payment_provider,
      currency
    });

    // Generate payment instructions for manual payments
    let paymentInstructions = null;
    if (payment_method === 'manual') {
      paymentInstructions = vendorRegistrationPaymentService.generatePaymentInstructions(
        payment_provider,
        payment.payment_reference,
        payment.amount
      );
    }

    res.status(201).json({
      success: true,
      message: 'Mobile payment created successfully',
      data: {
        payment,
        paymentInstructions
      }
    });
  } catch (error) {
    console.error('Error creating mobile payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create mobile payment',
      error: error.message
    });
  }
}

/**
 * Mobile app payment proof capture endpoint
 * POST /api/mobile/vendor-registration/payment/:id/capture
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function capturePaymentProof(req, res) {
  try {
    const { id } = req.params;
    const { image_id } = req.body;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    if (!image_id) {
      return res.status(400).json({
        success: false,
        message: 'Image ID is required'
      });
    }

    const payment = await vendorRegistrationPaymentService.uploadPaymentProof(
      paymentId,
      parseInt(image_id)
    );

    res.json({
      success: true,
      message: 'Payment proof captured successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error capturing payment proof:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to capture payment proof',
      error: error.message
    });
  }
}

/**
 * Generate QR code for payment (Mobile endpoint)
 * GET /api/mobile/vendor-registration/payment/:id/qr
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function generatePaymentQRCode(req, res) {
  try {
    const { id } = req.params;
    const paymentId = parseInt(id);

    if (isNaN(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID'
      });
    }

    const payment = await vendorRegistrationPaymentService.getPaymentById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Generate QR code data (this would typically use a QR code library)
    const qrData = {
      payment_id: payment.id,
      payment_reference: payment.payment_reference,
      amount: payment.amount,
      currency: payment.currency,
      payment_provider: payment.payment_provider
    };

    res.json({
      success: true,
      data: {
        qr_data: qrData,
        qr_code: `QR_CODE_${payment.payment_reference}` // Placeholder for actual QR code
      }
    });
  } catch (error) {
    console.error('Error generating payment QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment QR code',
      error: error.message
    });
  }
}

/**
 * Process Stripe webhook
 * POST /api/vendor-registration/payment/webhook/stripe
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function processStripeWebhook(req, res) {
  try {
    // TODO: Implement Stripe webhook processing
    // This would typically involve:
    // 1. Verify webhook signature
    // 2. Parse webhook event
    // 3. Update payment status based on event type
    // 4. Create vendor account if payment successful
    
    res.json({
      success: true,
      message: 'Stripe webhook processed successfully'
    });
  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Stripe webhook',
      error: error.message
    });
  }
}

/**
 * Process Chapa webhook
 * POST /api/vendor-registration/payment/webhook/chapa
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function processChapaWebhook(req, res) {
  try {
    // TODO: Implement Chapa webhook processing
    // This would typically involve:
    // 1. Verify webhook signature
    // 2. Parse webhook event
    // 3. Update payment status based on event type
    // 4. Create vendor account if payment successful
    
    res.json({
      success: true,
      message: 'Chapa webhook processed successfully'
    });
  } catch (error) {
    console.error('Error processing Chapa webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Chapa webhook',
      error: error.message
    });
  }
}

/**
 * Process PayPal webhook
 * POST /api/vendor-registration/payment/webhook/paypal
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function processPayPalWebhook(req, res) {
  try {
    // TODO: Implement PayPal webhook processing
    // This would typically involve:
    // 1. Verify webhook signature
    // 2. Parse webhook event
    // 3. Update payment status based on event type
    // 4. Create vendor account if payment successful
    
    res.json({
      success: true,
      message: 'PayPal webhook processed successfully'
    });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process PayPal webhook',
      error: error.message
    });
  }
}

/**
 * Get payment instructions for manual payments
 * GET /api/vendor-registration/payment/instructions/:provider
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPaymentInstructions(req, res) {
  try {
    const { provider } = req.params;
    const { amount, reference } = req.query;

    if (!amount || !reference) {
      return res.status(400).json({
        success: false,
        message: 'Amount and reference are required'
      });
    }

    const instructions = vendorRegistrationPaymentService.generatePaymentInstructions(
      provider,
      reference,
      parseFloat(amount)
    );

    if (!instructions) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment provider'
      });
    }

    res.json({
      success: true,
      data: instructions
    });
  } catch (error) {
    console.error('Error getting payment instructions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment instructions',
      error: error.message
    });
  }
}

/**
 * Get available subscription plans
 * GET /api/vendor-registration/subscriptions/available
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAvailableSubscriptions(req, res) {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active' // Assuming there's a status field
      },
      select: {
        id: true,
        plan: true,
        amount: true,
        start_date: true,
        end_date: true
      }
    });

    res.json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    console.error('Error getting available subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available subscriptions',
      error: error.message
    });
  }
}

/**
 * Get subscription details
 * GET /api/vendor-registration/subscriptions/:id/details
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getSubscriptionDetails(req, res) {
  try {
    const { id } = req.params;
    const subscriptionId = parseInt(id);

    if (isNaN(subscriptionId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription ID'
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: {
        id: true,
        plan: true,
        amount: true,
        start_date: true,
        end_date: true,
        status: true
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Error getting subscription details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription details',
      error: error.message
    });
  }
}

module.exports = {
  createPayment,
  getPaymentById,
  updatePaymentStatus,
  processIntegratedPayment,
  uploadPaymentProof,
  verifyManualPayment,
  getPaymentsWithFilters,
  getPendingPayments,
  getPaymentStatistics,
  createMobilePayment,
  capturePaymentProof,
  generatePaymentQRCode,
  processStripeWebhook,
  processChapaWebhook,
  processPayPalWebhook,
  getPaymentInstructions,
  getAvailableSubscriptions,
  getSubscriptionDetails
};
