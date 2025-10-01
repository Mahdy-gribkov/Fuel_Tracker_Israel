/**
 * Home Page Component
 * 
 * This is the main landing page of the Fuel Tracker Global application.
 * It provides an interactive map and station listing with live data integration.
 * 
 * Features:
 * - Interactive global map with real-time station data
 * - Advanced filtering and search capabilities
 * - Live data integration with fallback to mock data
 * - Accessibility-compliant interface
 * - Performance optimizations
 * - Real-time price updates
 * 
 * @author Fuel Tracker Global Team
 * @version 2.0.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import { useMockData, useFilteredStations, useFavorites } from '../hooks/useMockData';
import { useLiveStationData, useComprehensiveLiveData, useLiveDataManager } from '../hooks/useLiveData';
import { useAccessibility } from '../components/AccessibilityProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import EnhancedStationCard from '../components/EnhancedStationCard';
import FilterPanel from '../components/FilterPanel';
import StatsPanel from '../components/StatsPanel';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Home = () => {
  // Hooks for data management
  const { data: mockData, loading: mockDataLoading } = useMockData();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { isOnline, lastUpdate, refreshData, isRefreshing } = useLiveDataManager({
    autoRefresh: true,
    refreshInterval: 60000 // 1 minute
  });
  const accessibility = useAccessibility();

  // Live data integration
  const { data: liveData, isLoading: liveDataLoading } = useComprehensiveLiveData();
  const { data: liveStations, isLoading: liveStationsLoading } = useLiveStationData();

  // Local state management
  const [filters, setFilters] = useState({
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
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [selectedStation, setSelectedStation] = useState(null);
  const [showLiveDataIndicator, setShowLiveDataIndicator] = useState(false);

  // Combine live data with mock data
  const combinedData = useMemo(() => {
    if (liveData?.success && liveStations?.success) {
      return {
        stations: liveStations.data || mockData.stations,
        analytics: {
          ...mockData.analytics,
          lastUpdated: liveData.data.lastUpdated,
          liveDataAvailable: true
        },
        news: liveData.data.news?.data || mockData.news
      };
    }
    return mockData;
  }, [liveData, liveStations, mockData]);

  // Use filtered stations with combined data
  const { stations, loading: stationsLoading } = useFilteredStations(filters, combinedData.stations);

  const getCurrency = (countryCode) => {
    const currencies = {
      israel: '₪',
      usa: '$',
      europe: '€'
    };
    return currencies[countryCode] || '$';
  };

  const getFuelTypeName = (fuelType, countryCode) => {
    const fuelTypes = {
      israel: {
        gasoline95: '95 Octane',
        gasoline98: '98 Octane',
        diesel: 'Diesel'
      },
      usa: {
        regular: 'Regular',
        midgrade: 'Midgrade',
        premium: 'Premium',
        diesel: 'Diesel'
      },
      europe: {
        gasoline95: '95 Octane',
        gasoline98: '98 Octane',
        diesel: 'Diesel'
      }
    };
    return fuelTypes[countryCode]?.[fuelType] || fuelType;
  };

  const formatPrice = (price, countryCode) => {
    const currency = getCurrency(countryCode);
    return price ? `${currency}${price.toFixed(2)}` : 'N/A';
  };

  const getMapCenter = () => {
    if (filters.country === 'israel') return [31.7683, 35.2137];
    if (filters.country === 'usa') return [39.8283, -98.5795];
    if (filters.country === 'europe') return [54.5260, 15.2551];
    return [20, 0]; // World view
  };

  const getMapZoom = () => {
    if (filters.country) return 6;
    if (filters.city) return 10;
    return 3; // World view
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading global fuel data..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Find the Best Fuel Prices
            <span className="block text-yellow-300">Worldwide</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Real-time fuel prices from {data.analytics.totalStations.toLocaleString()} stations 
            across Israel, USA, and Europe
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <button
              onClick={() => setViewMode('map')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                viewMode === 'map'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🗺️ Map View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📋 List View
            </button>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              stations={data.stations}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Panel */}
            <StatsPanel
              stations={stations}
              analytics={data.analytics}
              loading={stationsLoading}
            />

            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {stations.length.toLocaleString()} Stations Found
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                  <option value="distance">Distance</option>
                </select>
              </div>
            </div>

            {/* Map or List View */}
            <AnimatePresence mode="wait">
              {viewMode === 'map' ? (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                  style={{ height: '600px' }}
                >
                  <MapContainer
                    center={getMapCenter()}
                    zoom={getMapZoom()}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {stations.slice(0, 1000).map(station => (
                      <Marker
                        key={station._id}
                        position={[station.coordinates.lat, station.coordinates.lng]}
                        eventHandlers={{
                          click: () => setSelectedStation(station)
                        }}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-bold text-lg">{station.name}</h3>
                            <p className="text-gray-600">{station.address}</p>
                            <p className="text-sm text-blue-600 font-semibold">{station.brand}</p>
                            <div className="mt-2 space-y-1">
                              {Object.entries(station.fuelTypes).map(([fuelType, data]) => (
                                <div key={fuelType} className="flex justify-between text-sm">
                                  <span>{getFuelTypeName(fuelType, station.countryCode)}:</span>
                                  <span className="font-semibold">
                                    {formatPrice(data.price, station.countryCode)}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 flex items-center">
                              <span className="text-yellow-500">⭐</span>
                              <span className="ml-1 text-sm">{station.rating.toFixed(1)}</span>
                              <span className="ml-1 text-xs text-gray-500">({station.reviewCount})</span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {stationsLoading ? (
                    <LoadingSpinner text="Loading stations..." />
                  ) : (
                    stations.map((station, index) => (
                      <motion.div
                        key={station._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <StationCard
                          station={station}
                          isFavorite={isFavorite(station._id)}
                          onToggleFavorite={() => {
                            if (isFavorite(station._id)) {
                              removeFromFavorites(station._id);
                            } else {
                              addToFavorites(station._id);
                            }
                          }}
                          formatPrice={formatPrice}
                          getFuelTypeName={getFuelTypeName}
                        />
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
