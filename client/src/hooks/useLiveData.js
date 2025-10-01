/**
 * Custom Hook for Live Data Management
 * 
 * This hook provides a unified interface for fetching and managing live data
 * with automatic caching, error handling, and fallback mechanisms.
 * 
 * Features:
 * - Automatic caching with configurable TTL
 * - Error handling and retry logic
 * - Loading states management
 * - Fallback to mock data when APIs fail
 * - Real-time updates with polling
 * 
 * @author Fuel Tracker Global Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { liveDataService, liveDataCache } from '../services/liveDataService';
import { mockData } from '../data/mockData';

// Query keys for React Query
export const QUERY_KEYS = {
  CURRENCY_RATES: 'currencyRates',
  WEATHER_DATA: 'weatherData',
  ISRAEL_FUEL_PRICES: 'israelFuelPrices',
  USA_FUEL_PRICES: 'usaFuelPrices',
  EUROPE_FUEL_PRICES: 'europeFuelPrices',
  LIVE_NEWS: 'liveNews',
  MARKET_TRENDS: 'marketTrends',
  LIVE_STATIONS: 'liveStations',
  COMPREHENSIVE_DATA: 'comprehensiveData'
};

/**
 * Hook for fetching currency exchange rates
 * @param {Object} options - Query options
 * @returns {Object} - Query result with currency data
 */
export const useCurrencyRates = (options = {}) => {
  return useQuery(
    QUERY_KEYS.CURRENCY_RATES,
    async () => {
      const result = await liveDataService.getCurrencyRates();
      if (result.success) {
        liveDataCache.set(QUERY_KEYS.CURRENCY_RATES, result.data);
      }
      return result;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
      retry: 2,
      retryDelay: 1000,
      ...options
    }
  );
};

/**
 * Hook for fetching weather data
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {Object} options - Query options
 * @returns {Object} - Query result with weather data
 */
export const useWeatherData = (lat, lng, options = {}) => {
  return useQuery(
    [QUERY_KEYS.WEATHER_DATA, lat, lng],
    async () => {
      if (!lat || !lng) return { success: false, data: null };
      
      const result = await liveDataService.getWeatherData(lat, lng);
      if (result.success) {
        liveDataCache.set(`${QUERY_KEYS.WEATHER_DATA}_${lat}_${lng}`, result.data);
      }
      return result;
    },
    {
      enabled: !!(lat && lng),
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
      retry: 2,
      ...options
    }
  );
};

/**
 * Hook for fetching Israel fuel prices
 * @param {Object} options - Query options
 * @returns {Object} - Query result with fuel prices
 */
export const useIsraelFuelPrices = (options = {}) => {
  return useQuery(
    QUERY_KEYS.ISRAEL_FUEL_PRICES,
    async () => {
      const result = await liveDataService.getIsraelFuelPrices();
      if (result.success) {
        liveDataCache.set(QUERY_KEYS.ISRAEL_FUEL_PRICES, result.data);
      }
      return result;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
      retry: 3,
      ...options
    }
  );
};

/**
 * Hook for fetching USA fuel prices
 * @param {Object} options - Query options
 * @returns {Object} - Query result with fuel prices
 */
export const useUSAFuelPrices = (options = {}) => {
  return useQuery(
    QUERY_KEYS.USA_FUEL_PRICES,
    async () => {
      const result = await liveDataService.getUSAFuelPrices();
      if (result.success) {
        liveDataCache.set(QUERY_KEYS.USA_FUEL_PRICES, result.data);
      }
      return result;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
      retry: 3,
      ...options
    }
  );
};

/**
 * Hook for fetching Europe fuel prices
 * @param {Object} options - Query options
 * @returns {Object} - Query result with fuel prices
 */
export const useEuropeFuelPrices = (options = {}) => {
  return useQuery(
    QUERY_KEYS.EUROPE_FUEL_PRICES,
    async () => {
      const result = await liveDataService.getEuropeFuelPrices();
      if (result.success) {
        liveDataCache.set(QUERY_KEYS.EUROPE_FUEL_PRICES, result.data);
      }
      return result;
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
      retry: 3,
      ...options
    }
  );
};

/**
 * Hook for fetching live news
 * @param {string} query - Search query
 * @param {Object} options - Query options
 * @returns {Object} - Query result with news data
 */
export const useLiveNews = (query = 'fuel prices', options = {}) => {
  return useQuery(
    [QUERY_KEYS.LIVE_NEWS, query],
    async () => {
      const result = await liveDataService.getLiveNews(query);
      if (result.success) {
        liveDataCache.set(`${QUERY_KEYS.LIVE_NEWS}_${query}`, result.data);
      }
      return result;
    },
    {
      staleTime: 15 * 60 * 1000, // 15 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
      retry: 2,
      ...options
    }
  );
};

/**
 * Hook for fetching market trends
 * @param {Object} options - Query options
 * @returns {Object} - Query result with market data
 */
export const useMarketTrends = (options = {}) => {
  return useQuery(
    QUERY_KEYS.MARKET_TRENDS,
    async () => {
      const result = await liveDataService.getMarketTrends();
      if (result.success) {
        liveDataCache.set(QUERY_KEYS.MARKET_TRENDS, result.data);
      }
      return result;
    },
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 1 * 60 * 1000, // Refetch every minute
      retry: 3,
      ...options
    }
  );
};

/**
 * Hook for fetching live station data
 * @param {string} country - Country filter
 * @param {Object} options - Query options
 * @returns {Object} - Query result with station data
 */
export const useLiveStationData = (country = '', options = {}) => {
  return useQuery(
    [QUERY_KEYS.LIVE_STATIONS, country],
    async () => {
      const result = await liveDataService.getLiveStationData(country);
      if (result.success) {
        liveDataCache.set(`${QUERY_KEYS.LIVE_STATIONS}_${country}`, result.data);
      }
      return result;
    },
    {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
      retry: 3,
      ...options
    }
  );
};

/**
 * Hook for fetching comprehensive live data
 * @param {Object} options - Query options
 * @returns {Object} - Query result with all live data
 */
export const useComprehensiveLiveData = (options = {}) => {
  return useQuery(
    QUERY_KEYS.COMPREHENSIVE_DATA,
    async () => {
      const result = await liveDataService.getComprehensiveLiveData();
      if (result.success) {
        liveDataCache.set(QUERY_KEYS.COMPREHENSIVE_DATA, result.data);
      }
      return result;
    },
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 1 * 60 * 1000, // Refetch every minute
      retry: 2,
      ...options
    }
  );
};

/**
 * Hook for managing live data with enhanced features
 * @param {Object} config - Configuration object
 * @returns {Object} - Enhanced live data management
 */
export const useLiveDataManager = (config = {}) => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const intervalRef = useRef(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-refresh mechanism
  useEffect(() => {
    if (config.autoRefresh && isOnline) {
      intervalRef.current = setInterval(() => {
        queryClient.invalidateQueries();
        setLastUpdate(new Date());
      }, config.refreshInterval || 60000); // Default 1 minute

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [config.autoRefresh, config.refreshInterval, isOnline, queryClient]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    try {
      await queryClient.invalidateQueries();
      setLastUpdate(new Date());
      return true;
    } catch (error) {
      console.error('Failed to refresh data:', error);
      return false;
    }
  }, [queryClient]);

  // Clear cache function
  const clearCache = useCallback(() => {
    queryClient.clear();
    liveDataCache.clear();
  }, [queryClient]);

  // Get cache status
  const getCacheStatus = useCallback(() => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(query => query.isStale()).length,
      errorQueries: queries.filter(query => query.state.status === 'error').length,
      lastUpdate
    };
  }, [queryClient, lastUpdate]);

  return {
    isOnline,
    lastUpdate,
    refreshData,
    clearCache,
    getCacheStatus,
    isRefreshing: queryClient.isFetching() > 0
  };
};

/**
 * Hook for real-time price monitoring
 * @param {string} stationId - Station ID to monitor
 * @param {string} fuelType - Fuel type to monitor
 * @param {number} targetPrice - Target price for alerts
 * @returns {Object} - Price monitoring data
 */
export const usePriceMonitoring = (stationId, fuelType, targetPrice) => {
  const [priceHistory, setPriceHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Monitor price changes
  useEffect(() => {
    if (!stationId || !fuelType || !isMonitoring) return;

    const interval = setInterval(async () => {
      try {
        const result = await liveDataService.getLiveStationData();
        if (result.success) {
          const station = result.data.find(s => s._id === stationId);
          if (station && station.fuelTypes[fuelType]) {
            const currentPrice = station.fuelTypes[fuelType].price;
            
            // Update price history
            setPriceHistory(prev => [
              ...prev.slice(-99), // Keep last 100 entries
              {
                timestamp: new Date().toISOString(),
                price: currentPrice
              }
            ]);

            // Check for price alerts
            if (targetPrice && currentPrice <= targetPrice) {
              const alert = {
                id: Date.now(),
                stationId,
                fuelType,
                currentPrice,
                targetPrice,
                timestamp: new Date().toISOString()
              };
              
              setAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
            }
          }
        }
      } catch (error) {
        console.error('Price monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [stationId, fuelType, targetPrice, isMonitoring]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    priceHistory,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts
  };
};

// Export all hooks
export default {
  useCurrencyRates,
  useWeatherData,
  useIsraelFuelPrices,
  useUSAFuelPrices,
  useEuropeFuelPrices,
  useLiveNews,
  useMarketTrends,
  useLiveStationData,
  useComprehensiveLiveData,
  useLiveDataManager,
  usePriceMonitoring
};
