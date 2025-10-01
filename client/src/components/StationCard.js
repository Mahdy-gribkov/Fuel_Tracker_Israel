import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const StationCard = ({ 
  station, 
  isFavorite, 
  onToggleFavorite, 
  formatPrice, 
  getFuelTypeName 
}) => {
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
      'Shell': 'bg-red-100 text-red-800',
      'BP': 'bg-green-100 text-green-800',
      'Exxon': 'bg-blue-100 text-blue-800',
      'Chevron': 'bg-yellow-100 text-yellow-800',
      'Paz': 'bg-orange-100 text-orange-800',
      'Sonol': 'bg-purple-100 text-purple-800',
      'Delek': 'bg-indigo-100 text-indigo-800',
      'Total': 'bg-pink-100 text-pink-800',
      'Eni': 'bg-teal-100 text-teal-800'
    };
    return colors[brand] || 'bg-gray-100 text-gray-800';
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{getCountryFlag(station.countryCode)}</span>
              <h3 className="text-xl font-bold text-gray-900">{station.name}</h3>
            </div>
            <p className="text-gray-600 mb-2">{station.address}</p>
            <p className="text-sm text-gray-500">{station.city}, {station.country}</p>
          </div>
          <motion.button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full transition-colors duration-200 ${
              isFavorite 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFavorite ? '❤️' : '🤍'}
          </motion.button>
        </div>

        {/* Brand and Rating */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBrandColor(station.brand)}`}>
            {station.brand}
          </span>
          <div className="flex items-center space-x-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold">{station.rating.toFixed(1)}</span>
            <span className="text-gray-500 text-sm">({station.reviewCount})</span>
          </div>
        </div>

        {/* Fuel Prices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {Object.entries(station.fuelTypes).map(([fuelType, data]) => (
            <div key={fuelType} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {getFuelTypeName(fuelType, station.countryCode)}
                </span>
                <span className="text-xs text-gray-500">
                  {getTrendIcon(data.trend)}
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatPrice(data.price, station.countryCode)}
              </div>
              {data.change !== 0 && (
                <div className={`text-xs ${
                  data.change > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {data.change > 0 ? '+' : ''}{data.change.toFixed(3)}
                </div>
              )}
            </div>
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

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Updated {format(new Date(station.lastScraped), 'MMM d, HH:mm')}</span>
          <div className="flex items-center space-x-2">
            <span>24/7</span>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StationCard;
