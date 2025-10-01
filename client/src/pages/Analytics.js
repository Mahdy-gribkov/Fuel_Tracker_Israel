import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useMockData, usePriceHistory } from '../hooks/useMockData';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const { data, loading } = useMockData();
  const [selectedCountry, setSelectedCountry] = useState('israel');
  const [selectedFuelType, setSelectedFuelType] = useState('gasoline95');
  const [timeRange, setTimeRange] = useState('30');
  const [priceHistory, setPriceHistory] = useState([]);

  const { history, loading: historyLoading } = usePriceHistory(
    'sample_station',
    selectedFuelType,
    parseInt(timeRange)
  );

  useEffect(() => {
    setPriceHistory(history);
  }, [history]);

  const getCountryData = () => {
    const countryStations = data.stations.filter(
      station => station.countryCode === selectedCountry
    );

    const fuelTypeData = {};
    countryStations.forEach(station => {
      Object.entries(station.fuelTypes).forEach(([fuelType, fuelData]) => {
        if (!fuelTypeData[fuelType]) {
          fuelTypeData[fuelType] = [];
        }
        fuelTypeData[fuelType].push(fuelData.price);
      });
    });

    return Object.entries(fuelTypeData).map(([fuelType, prices]) => ({
      fuelType: fuelType.replace(/([A-Z])/g, ' $1').trim(),
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      count: prices.length
    }));
  };

  const getCityData = () => {
    const countryStations = data.stations.filter(
      station => station.countryCode === selectedCountry
    );

    const cityStats = {};
    countryStations.forEach(station => {
      if (!cityStats[station.city]) {
        cityStats[station.city] = {
          count: 0,
          totalRating: 0,
          prices: []
        };
      }
      cityStats[station.city].count++;
      cityStats[station.city].totalRating += station.rating;
      
      const price = station.fuelTypes[selectedFuelType]?.price;
      if (price) {
        cityStats[station.city].prices.push(price);
      }
    });

    return Object.entries(cityStats)
      .map(([city, stats]) => ({
        city,
        stations: stats.count,
        avgRating: stats.totalRating / stats.count,
        avgPrice: stats.prices.length > 0 
          ? stats.prices.reduce((sum, price) => sum + price, 0) / stats.prices.length 
          : 0
      }))
      .sort((a, b) => b.stations - a.stations)
      .slice(0, 10);
  };

  const getBrandData = () => {
    const countryStations = data.stations.filter(
      station => station.countryCode === selectedCountry
    );

    const brandStats = {};
    countryStations.forEach(station => {
      if (!brandStats[station.brand]) {
        brandStats[station.brand] = {
          count: 0,
          totalRating: 0,
          prices: []
        };
      }
      brandStats[station.brand].count++;
      brandStats[station.brand].totalRating += station.rating;
      
      const price = station.fuelTypes[selectedFuelType]?.price;
      if (price) {
        brandStats[station.brand].prices.push(price);
      }
    });

    return Object.entries(brandStats)
      .map(([brand, stats]) => ({
        brand,
        count: stats.count,
        avgRating: stats.totalRating / stats.count,
        avgPrice: stats.prices.length > 0 
          ? stats.prices.reduce((sum, price) => sum + price, 0) / stats.prices.length 
          : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getCurrency = () => {
    const currencies = {
      israel: '₪',
      usa: '$',
      europe: '€'
    };
    return currencies[selectedCountry] || '$';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  if (loading) {
    return <LoadingSpinner size="large" text="Loading analytics data..." />;
  }

  const countryData = getCountryData();
  const cityData = getCityData();
  const brandData = getBrandData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📊 Fuel Price Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive analysis of fuel prices across different regions, brands, and time periods
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="israel">🇮🇱 Israel</option>
                <option value="usa">🇺🇸 United States</option>
                <option value="europe">🇪🇺 Europe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Type
              </label>
              <select
                value={selectedFuelType}
                onChange={(e) => setSelectedFuelType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {countryData.map((fuel) => (
                  <option key={fuel.fuelType} value={fuel.fuelType.replace(/\s+/g, '')}>
                    {fuel.fuelType}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => window.print()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                📄 Export Report
              </button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {countryData.map((fuel, index) => (
            <div key={fuel.fuelType} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{fuel.fuelType}</h3>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">{index + 1}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Average:</span>
                  <span className="font-semibold">{getCurrency()}{fuel.avg.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Min:</span>
                  <span className="font-semibold text-green-600">{getCurrency()}{fuel.min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max:</span>
                  <span className="font-semibold text-red-600">{getCurrency()}{fuel.max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stations:</span>
                  <span className="font-semibold">{fuel.count}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Price History Chart */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📈 Price History ({timeRange} days)
            </h3>
            {historyLoading ? (
              <LoadingSpinner text="Loading price history..." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${getCurrency()}${value}`, 'Price']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* City Distribution */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🏙️ Top Cities by Station Count
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stations" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Brand Distribution */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🏢 Brand Market Share
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ brand, count }) => `${brand} (${count})`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {brandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Price vs Rating Scatter */}
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              💰 Price vs Rating Analysis
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="avgPrice" fill="#3B82F6" name="Avg Price" />
                <Bar yAxisId="right" dataKey="avgRating" fill="#F59E0B" name="Avg Rating" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            💡 Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">📊 Market Overview</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• {data.stations.filter(s => s.countryCode === selectedCountry).length} total stations in {selectedCountry}</li>
                  <li>• Average rating: {(data.stations.filter(s => s.countryCode === selectedCountry).reduce((sum, s) => sum + s.rating, 0) / data.stations.filter(s => s.countryCode === selectedCountry).length).toFixed(1)}/5</li>
                  <li>• {brandData.length} different brands operating</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">💰 Price Analysis</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Cheapest city: {cityData[cityData.length - 1]?.city} ({getCurrency()}{cityData[cityData.length - 1]?.avgPrice.toFixed(2)})</li>
                  <li>• Most expensive city: {cityData[0]?.city} ({getCurrency()}{cityData[0]?.avgPrice.toFixed(2)})</li>
                  <li>• Price range: {getCurrency()}{Math.min(...cityData.map(c => c.avgPrice)).toFixed(2)} - {getCurrency()}{Math.max(...cityData.map(c => c.avgPrice)).toFixed(2)}</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">⭐ Quality Insights</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Highest rated city: {cityData.sort((a, b) => b.avgRating - a.avgRating)[0]?.city} ({cityData.sort((a, b) => b.avgRating - a.avgRating)[0]?.avgRating.toFixed(1)}⭐)</li>
                  <li>• Most stations: {cityData[0]?.city} ({cityData[0]?.stations} stations)</li>
                  <li>• Best value: {cityData.sort((a, b) => (a.avgPrice / a.avgRating) - (b.avgPrice / b.avgRating))[0]?.city}</li>
                </ul>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">🔮 Recommendations</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Best time to fill up: Early morning (6-8 AM)</li>
                  <li>• Avoid peak hours: 5-7 PM weekdays</li>
                  <li>• Consider {brandData[0]?.brand} for best value</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
