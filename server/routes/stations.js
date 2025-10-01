const express = require('express');
const Station = require('../models/Station');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// @route   GET /api/stations
// @desc    Get all stations with optional filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { city, brand, lat, lng, radius } = req.query;
    let query = { isActive: true };

    // Filter by city
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Filter by brand
    if (brand) {
      query.brand = brand;
    }

    // Geospatial query for nearby stations
    if (lat && lng && radius) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    const stations = await Station.find(query)
      .sort({ 'fuelTypes.gasoline95.price': 1 })
      .limit(100);

    res.json(stations);
  } catch (error) {
    console.error('Get stations error:', error);
    res.status(500).json({
      message: 'Server error while fetching stations'
    });
  }
});

// @route   GET /api/stations/:id
// @desc    Get single station by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({
        message: 'Station not found'
      });
    }

    res.json(station);
  } catch (error) {
    console.error('Get station error:', error);
    res.status(500).json({
      message: 'Server error while fetching station'
    });
  }
});

// @route   POST /api/stations
// @desc    Create a new station (admin only)
// @access  Private
router.post('/', [
  body('name').trim().notEmpty().withMessage('Station name is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('coordinates.lat').isNumeric().withMessage('Valid latitude is required'),
  body('coordinates.lng').isNumeric().withMessage('Valid longitude is required'),
  body('brand').isIn(['Paz', 'Sonol', 'Delek', 'Dor Alon', 'Tene', 'Other']).withMessage('Valid brand is required')
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

    const station = new Station(req.body);
    await station.save();

    res.status(201).json({
      message: 'Station created successfully',
      station
    });
  } catch (error) {
    console.error('Create station error:', error);
    res.status(500).json({
      message: 'Server error while creating station'
    });
  }
});

// @route   PUT /api/stations/:id
// @desc    Update station prices
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { fuelTypes } = req.body;
    
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({
        message: 'Station not found'
      });
    }

    // Update fuel prices with timestamps
    if (fuelTypes) {
      Object.keys(fuelTypes).forEach(fuelType => {
        if (fuelTypes[fuelType] && fuelTypes[fuelType].price) {
          station.fuelTypes[fuelType] = {
            price: fuelTypes[fuelType].price,
            lastUpdated: new Date()
          };
        }
      });
    }

    station.lastScraped = new Date();
    await station.save();

    res.json({
      message: 'Station updated successfully',
      station
    });
  } catch (error) {
    console.error('Update station error:', error);
    res.status(500).json({
      message: 'Server error while updating station'
    });
  }
});

// @route   GET /api/stations/search/:query
// @desc    Search stations by name or address
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    
    const stations = await Station.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { address: { $regex: query, $options: 'i' } },
            { city: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).limit(20);

    res.json(stations);
  } catch (error) {
    console.error('Search stations error:', error);
    res.status(500).json({
      message: 'Server error while searching stations'
    });
  }
});

module.exports = router;
