import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterPanel = ({ filters, onFiltersChange, stations }) => {
  const [isExpanded, setIsExpanded] = useState({
    location: true,
    fuel: true,
    price: true,
    services: false
  });

  const toggleSection = (section) => {
    setIsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get unique values for filters
  const getUniqueValues = (field) => {
    return [...new Set(stations.map(station => station[field]))].sort();
  };

  const getUniqueServices = () => {
    const allServices = stations.flatMap(station => station.services || []);
    return [...new Set(allServices)].sort();
  };

  const getFuelTypes = () => {
    const allFuelTypes = new Set();
    stations.forEach(station => {
      Object.keys(station.fuelTypes || {}).forEach(fuelType => {
        allFuelTypes.add(fuelType);
      });
    });
    return Array.from(allFuelTypes).sort();
  };

  const getPriceRange = (fuelType) => {
    const prices = stations
      .map(station => station.fuelTypes?.[fuelType]?.price)
      .filter(price => price !== undefined);
    
    if (prices.length === 0) return { min: 0, max: 10 };
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  const clearFilters = () => {
    onFiltersChange({
      country: '',
      city: '',
      brand: '',
      fuelType: 'gasoline95',
      minPrice: '',
      maxPrice: '',
      rating: '',
      services: [],
      sortBy: 'price'
    });
  };

  const hasActiveFilters = () => {
    return filters.country || filters.city || filters.brand || 
           filters.minPrice || filters.maxPrice || filters.rating || 
           filters.services.length > 0;
  };

  const FilterSection = ({ title, section, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <button
        onClick={() => toggleSection(section)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <motion.span
          animate={{ rotate: isExpanded[section] ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence>
        {isExpanded[section] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Clear Filters */}
      {hasActiveFilters() && (
        <motion.button
          onClick={clearFilters}
          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Clear All Filters
        </motion.button>
      )}

      {/* Location Filters */}
      <FilterSection title="📍 Location" section="location">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={filters.country}
              onChange={(e) => onFiltersChange({ ...filters, country: e.target.value, city: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Countries</option>
              <option value="israel">🇮🇱 Israel</option>
              <option value="usa">🇺🇸 United States</option>
              <option value="europe">🇪🇺 Europe</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <select
              value={filters.city}
              onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!filters.country}
            >
              <option value="">All Cities</option>
              {filters.country && getUniqueValues('city').map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={filters.brand}
              onChange={(e) => onFiltersChange({ ...filters, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Brands</option>
              {getUniqueValues('brand').map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>
      </FilterSection>

      {/* Fuel Type */}
      <FilterSection title="⛽ Fuel Type" section="fuel">
        <div className="space-y-2">
          {getFuelTypes().map(fuelType => (
            <label key={fuelType} className="flex items-center">
              <input
                type="radio"
                name="fuelType"
                value={fuelType}
                checked={filters.fuelType === fuelType}
                onChange={(e) => onFiltersChange({ ...filters, fuelType: e.target.value })}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">
                {fuelType.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="💰 Price Range" section="price">
        <div className="space-y-3">
          {filters.fuelType && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.minPrice}
                  onChange={(e) => onFiltersChange({ ...filters, minPrice: e.target.value })}
                  placeholder={getPriceRange(filters.fuelType).min.toFixed(2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.maxPrice}
                  onChange={(e) => onFiltersChange({ ...filters, maxPrice: e.target.value })}
                  placeholder={getPriceRange(filters.fuelType).max.toFixed(2)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="text-xs text-gray-500">
                Range: {getPriceRange(filters.fuelType).min.toFixed(2)} - {getPriceRange(filters.fuelType).max.toFixed(2)}
              </div>
            </>
          )}
        </div>
      </FilterSection>

      {/* Services */}
      <FilterSection title="🛠️ Services" section="services">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {getUniqueServices().map(service => (
            <label key={service} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.services.includes(service)}
                onChange={(e) => {
                  const newServices = e.target.checked
                    ? [...filters.services, service]
                    : filters.services.filter(s => s !== service);
                  onFiltersChange({ ...filters, services: newServices });
                }}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{service}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="⭐ Rating" section="rating">
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0].map(rating => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating.toString()}
                onChange={(e) => onFiltersChange({ ...filters, rating: e.target.value })}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                {rating}+ ⭐
              </span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="rating"
              value=""
              checked={filters.rating === ''}
              onChange={(e) => onFiltersChange({ ...filters, rating: e.target.value })}
              className="mr-2 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Any Rating</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
};

export default FilterPanel;
