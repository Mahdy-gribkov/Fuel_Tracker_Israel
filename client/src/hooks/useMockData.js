import { useState, useEffect, useMemo } from 'react';
import { mockData } from '../data/mockData';

// Custom hook for managing mock data with realistic loading states
export const useMockData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, Math.random() * 1000 + 500); // 500-1500ms

    return () => clearTimeout(timer);
  }, []);

  const data = useMemo(() => mockData, []);

  return { data, loading, error };
};

// Hook for filtered stations
export const useFilteredStations = (filters = {}) => {
  const { data, loading } = useMockData();
  const [filteredStations, setFilteredStations] = useState([]);

  useEffect(() => {
    if (!data.stations) return;

    let filtered = [...data.stations];

    // Apply filters
    if (filters.country) {
      filtered = filtered.filter(station => station.countryCode === filters.country);
    }

    if (filters.city) {
      filtered = filtered.filter(station => 
        station.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.brand) {
      filtered = filtered.filter(station => station.brand === filters.brand);
    }

    if (filters.fuelType) {
      filtered = filtered.filter(station => 
        station.fuelTypes[filters.fuelType]?.price
      );
    }

    if (filters.minPrice || filters.maxPrice) {
      filtered = filtered.filter(station => {
        const price = station.fuelTypes[filters.fuelType]?.price;
        if (!price) return false;
        
        if (filters.minPrice && price < filters.minPrice) return false;
        if (filters.maxPrice && price > filters.maxPrice) return false;
        
        return true;
      });
    }

    if (filters.rating) {
      filtered = filtered.filter(station => station.rating >= filters.rating);
    }

    if (filters.services && filters.services.length > 0) {
      filtered = filtered.filter(station => 
        filters.services.some(service => station.services.includes(service))
      );
    }

    // Sort by price if fuel type specified
    if (filters.fuelType && filters.sortBy === 'price') {
      filtered.sort((a, b) => {
        const priceA = a.fuelTypes[filters.fuelType]?.price || Infinity;
        const priceB = b.fuelTypes[filters.fuelType]?.price || Infinity;
        return priceA - priceB;
      });
    }

    // Sort by rating
    if (filters.sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    // Sort by distance (simulated)
    if (filters.sortBy === 'distance' && filters.userLocation) {
      filtered.sort((a, b) => {
        const distanceA = calculateDistance(filters.userLocation, a.coordinates);
        const distanceB = calculateDistance(filters.userLocation, b.coordinates);
        return distanceA - distanceB;
      });
    }

    setFilteredStations(filtered);
  }, [data.stations, filters]);

  return { stations: filteredStations, loading };
};

// Hook for price analytics
export const usePriceAnalytics = (country, fuelType) => {
  const { data, loading } = useMockData();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (!data.stations) return;

    const countryStations = data.stations.filter(
      station => !country || station.countryCode === country
    );

    if (countryStations.length === 0) {
      setAnalytics(null);
      return;
    }

    const prices = countryStations
      .map(station => station.fuelTypes[fuelType]?.price)
      .filter(price => price !== undefined);

    if (prices.length === 0) {
      setAnalytics(null);
      return;
    }

    const stats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
      count: prices.length,
      stations: countryStations.length
    };

    setAnalytics(stats);
  }, [data.stations, country, fuelType]);

  return { analytics, loading };
};

// Hook for price history
export const usePriceHistory = (stationId, fuelType, days = 30) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      const priceHistory = mockData.priceHistory(stationId, fuelType, days);
      setHistory(priceHistory);
      setLoading(false);
    }, Math.random() * 500 + 200);

    return () => clearTimeout(timer);
  }, [stationId, fuelType, days]);

  return { history, loading };
};

// Hook for user favorites
export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('fuel-tracker-favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const addToFavorites = (stationId) => {
    if (!favorites.includes(stationId)) {
      const newFavorites = [...favorites, stationId];
      setFavorites(newFavorites);
      localStorage.setItem('fuel-tracker-favorites', JSON.stringify(newFavorites));
    }
  };

  const removeFromFavorites = (stationId) => {
    const newFavorites = favorites.filter(id => id !== stationId);
    setFavorites(newFavorites);
    localStorage.setItem('fuel-tracker-favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (stationId) => favorites.includes(stationId);

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  };
};

// Hook for price alerts
export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('fuel-tracker-alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const addAlert = (alert) => {
    const newAlert = {
      id: Date.now().toString(),
      ...alert,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    const newAlerts = [...alerts, newAlert];
    setAlerts(newAlerts);
    localStorage.setItem('fuel-tracker-alerts', JSON.stringify(newAlerts));
  };

  const removeAlert = (alertId) => {
    const newAlerts = alerts.filter(alert => alert.id !== alertId);
    setAlerts(newAlerts);
    localStorage.setItem('fuel-tracker-alerts', JSON.stringify(newAlerts));
  };

  const updateAlert = (alertId, updates) => {
    const newAlerts = alerts.map(alert => 
      alert.id === alertId ? { ...alert, ...updates } : alert
    );
    setAlerts(newAlerts);
    localStorage.setItem('fuel-tracker-alerts', JSON.stringify(newAlerts));
  };

  return {
    alerts,
    addAlert,
    removeAlert,
    updateAlert
  };
};

// Utility function to calculate distance between two coordinates
const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
