/**
 * Enhanced Station Card Component
 * 
 * This component provides an advanced station card with:
 * - Live data integration
 * - Accessibility features
 * - Interactive animations
 * - Real-time price updates
 * - Weather integration
 * - Enhanced user interactions
 * 
 * @author Fuel Tracker Global Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useAccessibility } from './AccessibilityProvider';
import { useWeatherData } from '../hooks/useLiveData';
import LoadingSpinner from './LoadingSpinner';

/**
 * Enhanced Station Card Component
 * @param {Object} props - Component props
 * @param {Object} props.station - Station data object
 * @param {boolean} props.isFavorite - Whether station is favorited
 * @param {Function} props.onToggleFavorite - Toggle favorite callback
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Function} props.getFuelTypeName - Fuel type name function
 * @param {Object} props.accessibility - Accessibility context
 * @returns {JSX.Element} - Enhanced station card
 */
const EnhancedStationCard = ({ 
  station, 
  isFavorite, 
  onToggleFavorite, 
  formatPrice, 
  getFuelTypeName,
  accessibility 
}) => {
  // Local state for enhanced interactions
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const cardRef = useRef(null);

  // Get weather data for station location
  const { data: weatherData, isLoading: weatherLoading } = useWeatherData(
    station.coordinates.lat,
    station.coordinates.lng
  );

  // Animation variants based on accessibility preferences
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: accessibility.isReducedMotion ? 0 : 0.3,
        ease: "easeOut"
      }
    },
    hover: {
      y: accessibility.isReducedMotion ? 0 : -8,
      scale: accessibility.isReducedMotion ? 1 : 1.02,
      transition: {
        duration: accessibility.isReducedMotion ? 0 : 0.2
      }
    },
    tap: {
      scale: accessibility.isReducedMotion ? 1 : 0.98,
      transition: {
        duration: accessibility.isReducedMotion ? 0 : 0.1
      }
    }
  };

  const expandVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: accessibility.isReducedMotion ? 0 : 0.3,
        ease: "easeInOut"
      }
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: accessibility.isReducedMotion ? 0 : 0.3,
        ease: "easeInOut"
      }
    }
  };

  // Utility functions
  const getCountryFlag = (countryCode) => {
    const flags = {
      israel: '🇮🇱',
      usa: '🇺🇸',
      europe: '🇪🇺'
    };
    return flags[countryCode] || '🌍';
  };

  const getBrandColor = (brand) => {
    const colors = {
      'Shell': 'bg-red-100 text-red-800 border-red-200',
      'BP': 'bg-green-100 text-green-800 border-green-200',
      'Exxon': 'bg-blue-100 text-blue-800 border-blue-200',
      'Chevron': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Paz': 'bg-orange-100 text-orange-800 border-orange-200',
      'Sonol': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delek': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Total': 'bg-pink-100 text-pink-800 border-pink-200',
      'Eni': 'bg-teal-100 text-teal-800 border-teal-200'
    };
    return colors[brand] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'text-red-600';
      case 'down': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Handle keyboard interactions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
      accessibility.announce(
        isExpanded ? 'Station details collapsed' : 'Station details expanded'
      );
    }
  };

  // Handle favorite toggle with accessibility
  const handleFavoriteToggle = () => {
    onToggleFavorite();
    accessibility.announce(
      isFavorite ? 'Removed from favorites' : 'Added to favorites'
    );
  };

  // Handle weather toggle
  const handleWeatherToggle = () => {
    setShowWeather(!showWeather);
    accessibility.announce(
      showWeather ? 'Weather information hidden' : 'Weather information shown'
    );
  };

  return (
    <motion.div
      ref={cardRef}
      className={`
        bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden
        ${accessibility.isHighContrast ? 'border-2 border-gray-900' : ''}
        ${accessibility.isKeyboardNavigation ? 'focus-within:ring-2 focus-within:ring-blue-500' : ''}
      `}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      role="article"
      aria-label={`Fuel station: ${station.name}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Main Card Content */}
      <div className="p-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span 
                className="text-lg" 
                role="img" 
                aria-label={`${station.country} flag`}
              >
                {getCountryFlag(station.countryCode)}
              </span>
              <h3 
                className="text-xl font-bold text-gray-900"
                id={`station-name-${station._id}`}
              >
                {station.name}
              </h3>
            </div>
            <p 
              className="text-gray-600 mb-2"
              aria-describedby={`station-name-${station._id}`}
            >
              {station.address}
            </p>
            <p className="text-sm text-gray-500">
              {station.city}, {station.country}
            </p>
          </div>
          
          {/* Favorite Button */}
          <motion.button
            onClick={handleFavoriteToggle}
            className={`
              p-2 rounded-full transition-colors duration-200
              ${isFavorite 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }
              ${accessibility.isHighContrast ? 'border-2 border-current' : ''}
            `}
            whileHover={{ scale: accessibility.isReducedMotion ? 1 : 1.1 }}
            whileTap={{ scale: accessibility.isReducedMotion ? 1 : 0.9 }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '❤️' : '🤍'}
          </motion.button>
        </div>

        {/* Brand and Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className={`
            px-3 py-1 rounded-full text-sm font-medium border
            ${getBrandColor(station.brand)}
          `}>
            {station.brand}
          </span>
          <div className="flex items-center space-x-1">
            <span 
              className="text-yellow-500" 
              role="img" 
              aria-label="Star rating"
            >
              ⭐
            </span>
            <span 
              className="font-semibold"
              aria-label={`Rating: ${station.rating} out of 5 stars`}
            >
              {station.rating.toFixed(1)}
            </span>
            <span className="text-gray-500 text-sm">
              ({station.reviewCount} reviews)
            </span>
          </div>
        </div>

        {/* Fuel Prices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {Object.entries(station.fuelTypes).map(([fuelType, data]) => (
            <motion.div
              key={fuelType}
              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors duration-200"
              whileHover={{ 
                scale: accessibility.isReducedMotion ? 1 : 1.02,
                transition: { duration: 0.2 }
              }}
              role="group"
              aria-label={`${getFuelTypeName(fuelType, station.countryCode)} pricing`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {getFuelTypeName(fuelType, station.countryCode)}
                </span>
                <span 
                  className={`text-xs ${getTrendColor(data.trend)}`}
                  role="img"
                  aria-label={`Price trend: ${data.trend}`}
                >
                  {getTrendIcon(data.trend)}
                </span>
              </div>
              <div 
                className="text-lg font-bold text-gray-900"
                aria-label={`Price: ${formatPrice(data.price, station.countryCode)}`}
              >
                {formatPrice(data.price, station.countryCode)}
              </div>
              {data.change !== 0 && (
                <div className={`text-xs ${getTrendColor(data.change > 0 ? 'up' : 'down')}`}>
                  {data.change > 0 ? '+' : ''}{data.change.toFixed(3)}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Services */}
        {station.services && station.services.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Services:</h4>
            <div className="flex flex-wrap gap-2">
              {station.services.slice(0, 4).map((service) => (
                <span
                  key={service}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  role="listitem"
                >
                  {service}
                </span>
              ))}
              {station.services.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{station.services.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
              whileHover={{ scale: accessibility.isReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: accessibility.isReducedMotion ? 1 : 0.95 }}
              aria-expanded={isExpanded}
              aria-controls={`station-details-${station._id}`}
            >
              {isExpanded ? 'Show Less' : 'Show More'}
            </motion.button>
            
            <motion.button
              onClick={handleWeatherToggle}
              className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 transition-colors duration-200"
              whileHover={{ scale: accessibility.isReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: accessibility.isReducedMotion ? 1 : 0.95 }}
              aria-expanded={showWeather}
              aria-controls={`weather-info-${station._id}`}
            >
              🌤️ Weather
            </motion.button>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Updated {format(new Date(station.lastScraped), 'MMM d, HH:mm')}</span>
            <div className="flex items-center space-x-1">
              <span>24/7</span>
              <div 
                className="w-2 h-2 bg-green-400 rounded-full"
                role="img"
                aria-label="Station is open"
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={`station-details-${station._id}`}
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="border-t border-gray-200 bg-gray-50"
          >
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Station Details</h4>
              
              {/* Opening Hours */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Opening Hours:</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(station.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-gray-600">{day}:</span>
                      <span className="text-gray-900">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* All Services */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">All Services:</h5>
                <div className="flex flex-wrap gap-2">
                  {station.services.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price History Button */}
              <motion.button
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                whileHover={{ scale: accessibility.isReducedMotion ? 1 : 1.02 }}
                whileTap={{ scale: accessibility.isReducedMotion ? 1 : 0.98 }}
              >
                📊 View Price History
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weather Information */}
      <AnimatePresence>
        {showWeather && (
          <motion.div
            id={`weather-info-${station._id}`}
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="border-t border-gray-200 bg-blue-50"
          >
            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Weather</h4>
              
              {weatherLoading ? (
                <LoadingSpinner size="small" text="Loading weather..." />
              ) : weatherData?.success ? (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-semibold">{weatherData.data.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity:</span>
                    <span className="font-semibold">{weatherData.data.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pressure:</span>
                    <span className="font-semibold">{weatherData.data.pressure} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind:</span>
                    <span className="font-semibold">{weatherData.data.windSpeed} m/s</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-gray-600 capitalize">
                      {weatherData.data.description}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Weather data unavailable</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedStationCard;
