const express = require('express');
const User = require('../models/User');
const Station = require('../models/Station');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/users/favorites
// @desc    Get user's favorite stations
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('favoriteStations');
    res.json(user.favoriteStations);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      message: 'Server error while fetching favorites'
    });
  }
});

// @route   POST /api/users/favorites
// @desc    Add station to favorites
// @access  Private
router.post('/favorites', [
  auth,
  body('stationId').isMongoId().withMessage('Valid station ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { stationId } = req.body;

    // Check if station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({
        message: 'Station not found'
      });
    }

    const user = await User.findById(req.userId);
    
    // Check if already in favorites
    if (user.favoriteStations.includes(stationId)) {
      return res.status(400).json({
        message: 'Station already in favorites'
      });
    }

    user.favoriteStations.push(stationId);
    await user.save();

    res.json({
      message: 'Station added to favorites',
      favorites: user.favoriteStations
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      message: 'Server error while adding favorite'
    });
  }
});

// @route   DELETE /api/users/favorites/:stationId
// @desc    Remove station from favorites
// @access  Private
router.delete('/favorites/:stationId', auth, async (req, res) => {
  try {
    const { stationId } = req.params;
    
    const user = await User.findById(req.userId);
    user.favoriteStations = user.favoriteStations.filter(
      id => id.toString() !== stationId
    );
    await user.save();

    res.json({
      message: 'Station removed from favorites',
      favorites: user.favoriteStations
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      message: 'Server error while removing favorite'
    });
  }
});

// @route   GET /api/users/alerts
// @desc    Get user's price alerts
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('priceAlerts.stationId');
    res.json(user.priceAlerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      message: 'Server error while fetching alerts'
    });
  }
});

// @route   POST /api/users/alerts
// @desc    Create a new price alert
// @access  Private
router.post('/alerts', [
  auth,
  body('stationId').isMongoId().withMessage('Valid station ID is required'),
  body('fuelType').isIn(['gasoline95', 'gasoline98', 'diesel']).withMessage('Valid fuel type is required'),
  body('targetPrice').isNumeric().withMessage('Valid target price is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { stationId, fuelType, targetPrice } = req.body;

    // Check if station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(404).json({
        message: 'Station not found'
      });
    }

    const user = await User.findById(req.userId);
    
    // Check if alert already exists for this station and fuel type
    const existingAlert = user.priceAlerts.find(
      alert => alert.stationId.toString() === stationId && alert.fuelType === fuelType
    );

    if (existingAlert) {
      return res.status(400).json({
        message: 'Alert already exists for this station and fuel type'
      });
    }

    const newAlert = {
      stationId,
      fuelType,
      targetPrice: parseFloat(targetPrice),
      isActive: true
    };

    user.priceAlerts.push(newAlert);
    await user.save();

    res.status(201).json({
      message: 'Price alert created successfully',
      alert: newAlert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      message: 'Server error while creating alert'
    });
  }
});

// @route   DELETE /api/users/alerts/:alertId
// @desc    Delete a price alert
// @access  Private
router.delete('/alerts/:alertId', auth, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const user = await User.findById(req.userId);
    user.priceAlerts = user.priceAlerts.filter(
      alert => alert._id.toString() !== alertId
    );
    await user.save();

    res.json({
      message: 'Price alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      message: 'Server error while deleting alert'
    });
  }
});

// @route   PUT /api/users/alerts/:alertId
// @desc    Update a price alert
// @access  Private
router.put('/alerts/:alertId', [
  auth,
  body('targetPrice').optional().isNumeric().withMessage('Valid target price is required'),
  body('isActive').optional().isBoolean().withMessage('Active status must be boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { alertId } = req.params;
    const { targetPrice, isActive } = req.body;
    
    const user = await User.findById(req.userId);
    const alert = user.priceAlerts.id(alertId);
    
    if (!alert) {
      return res.status(404).json({
        message: 'Alert not found'
      });
    }

    if (targetPrice !== undefined) {
      alert.targetPrice = parseFloat(targetPrice);
    }
    
    if (isActive !== undefined) {
      alert.isActive = isActive;
    }

    await user.save();

    res.json({
      message: 'Price alert updated successfully',
      alert
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      message: 'Server error while updating alert'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
  body('preferences.defaultCity').optional().trim(),
  body('preferences.preferredFuelType').optional().isIn(['gasoline95', 'gasoline98', 'diesel']),
  body('preferences.emailNotifications').optional().isBoolean(),
  body('preferences.pushNotifications').optional().isBoolean()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'preferences'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'preferences') {
          user.preferences = { ...user.preferences, ...req.body[field] };
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error while updating profile'
    });
  }
});

module.exports = router;
