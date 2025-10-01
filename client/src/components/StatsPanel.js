import React from 'react';
import { motion } from 'framer-motion';

const StatsPanel = ({ stations, analytics, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getCurrency = (countryCode) => {
    const currencies = {
      israel: '₪',
      usa: '$',
      europe: '€'
    };
    return currencies[countryCode] || '$';
  };

  const getCountryStats = () => {
    const countryStats = {};
    stations.forEach(station => {
      if (!countryStats[station.countryCode]) {
        countryStats[station.countryCode] = {
          count: 0,
          avgRating: 0,
          totalRating: 0,
          fuelTypes: {}
        };
      }
      countryStats[station.countryCode].count++;
      countryStats[station.countryCode].totalRating += station.rating;
      
      Object.entries(station.fuelTypes).forEach(([fuelType, data]) => {
        if (!countryStats[station.countryCode].fuelTypes[fuelType]) {
          countryStats[station.countryCode].fuelTypes[fuelType] = [];
        }
        countryStats[station.countryCode].fuelTypes[fuelType].push(data.price);
      });
    });

    // Calculate averages
    Object.keys(countryStats).forEach(country => {
      countryStats[country].avgRating = 
        countryStats[country].totalRating / countryStats[country].count;
      
      Object.keys(countryStats[country].fuelTypes).forEach(fuelType => {
        const prices = countryStats[country].fuelTypes[fuelType];
        countryStats[country].fuelTypes[fuelType] = {
          min: Math.min(...prices),
          max: Math.max(...prices),
          avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
        };
      });
    });

    return countryStats;
  };

  const countryStats = getCountryStats();

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <motion.div
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-lg p-4 border border-${color}-200`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`text-2xl text-${color}-600`}>{icon}</div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 mb-6">
      {/* Main Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Stations"
            value={stations.length.toLocaleString()}
            subtitle="Currently showing"
            icon="⛽"
            color="blue"
          />
          <StatCard
            title="Countries"
            value={Object.keys(countryStats).length}
            subtitle="Coverage"
            icon="🌍"
            color="green"
          />
          <StatCard
            title="Avg Rating"
            value={stations.length > 0 ? (stations.reduce((sum, s) => sum + s.rating, 0) / stations.length).toFixed(1) : '0.0'}
            subtitle="User satisfaction"
            icon="⭐"
            color="yellow"
          />
          <StatCard
            title="Active Alerts"
            value={analytics.totalAlerts.toLocaleString()}
            subtitle="Price monitoring"
            icon="🔔"
            color="purple"
          />
        </div>
      </div>

      {/* Country Breakdown */}
      {Object.keys(countryStats).length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🌍 By Country</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(countryStats).map(([countryCode, stats]) => {
              const countryNames = {
                israel: '🇮🇱 Israel',
                usa: '🇺🇸 United States',
                europe: '🇪🇺 Europe'
              };
              
              const currency = getCurrency(countryCode);
              const fuelTypes = Object.keys(stats.fuelTypes);
              const primaryFuelType = fuelTypes[0];
              const primaryFuelData = stats.fuelTypes[primaryFuelType];

              return (
                <motion.div
                  key={countryCode}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {countryNames[countryCode] || countryCode}
                    </h4>
                    <span className="text-sm text-gray-500">{stats.count} stations</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Avg Rating:</span>
                      <span className="font-semibold">{stats.avgRating.toFixed(1)} ⭐</span>
                    </div>
                    
                    {primaryFuelData && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Avg Price:</span>
                          <span className="font-semibold">
                            {currency}{primaryFuelData.avg.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Range:</span>
                          <span>
                            {currency}{primaryFuelData.min.toFixed(2)} - {currency}{primaryFuelData.max.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Trends */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Price Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(analytics.priceTrends).map(([country, trends]) => {
            const countryNames = {
              israel: '🇮🇱 Israel',
              usa: '🇺🇸 United States',
              europe: '🇪🇺 Europe'
            };
            
            return (
              <motion.div
                key={country}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <h4 className="font-semibold text-gray-900 mb-3">
                  {countryNames[country] || country}
                </h4>
                <div className="space-y-2">
                  {Object.entries(trends).map(([fuelType, trend]) => (
                    <div key={fuelType} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {fuelType.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className={`font-semibold ${
                        trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {trend > 0 ? '📈' : trend < 0 ? '📉' : '➡️'} {Math.abs(trend).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
