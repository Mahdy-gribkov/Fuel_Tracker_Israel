const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  fuelTypes: {
    gasoline95: {
      price: Number,
      lastUpdated: Date
    },
    gasoline98: {
      price: Number,
      lastUpdated: Date
    },
    diesel: {
      price: Number,
      lastUpdated: Date
    }
  },
  brand: {
    type: String,
    enum: ['Paz', 'Sonol', 'Delek', 'Dor Alon', 'Tene', 'Other'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  openingHours: {
    sunday: String,
    monday: String,
    tuesday: String,
    wednesday: String,
    thursday: String,
    friday: String,
    saturday: String
  },
  services: [{
    type: String,
    enum: ['Car Wash', 'Convenience Store', 'ATM', 'Restaurant', 'Air Pump', 'Tire Service']
  }],
  lastScraped: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
stationSchema.index({ coordinates: '2dsphere' });

// Index for efficient searches
stationSchema.index({ city: 1, brand: 1 });
stationSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Station', stationSchema);