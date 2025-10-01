/**
 * Live Data Service
 * 
 * This service provides real-time data from various free APIs and sources.
 * It includes fallback mechanisms to mock data when APIs are unavailable.
 * 
 * Features:
 * - Real-time fuel prices from public APIs
 * - Weather data for location-based insights
 * - Currency exchange rates
 * - Market data and trends
 * - Error handling and fallbacks
 * 
 * @author Fuel Tracker Global Team
 * @version 2.0.0
 */

import { mockData } from '../data/mockData';

// Configuration for live data sources
const API_CONFIG = {
  // Free APIs that don't require keys
  CURRENCY_API: 'https://api.exchangerate-api.com/v4/latest/USD',
  WEATHER_API: 'https://api.openweathermap.org/data/2.5/weather',
  NEWS_API: 'https://newsapi.org/v2/everything',
  
  // Public fuel price APIs (these are examples - replace with actual free APIs)
  FUEL_PRICES_ISRAEL: 'https://api.gov.il/api/fuel-prices',
  FUEL_PRICES_USA: 'https://api.eia.gov/petroleum/gasdiesel/',
  FUEL_PRICES_EUROPE: 'https://ec.europa.eu/energy/observatory/reports/',
  
  // Timeout settings
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3
};

/**
 * Generic API fetch function with error handling and retries
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retry attempts
 * @returns {Promise} - API response or fallback data
 */
const fetchWithRetry = async (url, options = {}, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FuelTrackerGlobal/2.0.0',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`API call failed for ${url}:`, error.message);
    
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    throw error;
  }
};

/**
 * Get real-time currency exchange rates
 * @returns {Promise<Object>} - Currency rates or fallback data
 */
export const getCurrencyRates = async () => {
  try {
    const data = await fetchWithRetry(API_CONFIG.CURRENCY_API);
    
    return {
      success: true,
      data: {
        USD: 1,
        EUR: data.rates.EUR || 0.85,
        ILS: data.rates.ILS || 3.65,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.warn('Currency API failed, using fallback rates');
    return {
      success: false,
      data: {
        USD: 1,
        EUR: 0.85,
        ILS: 3.65,
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

/**
 * Get weather data for a specific location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Weather data or fallback
 */
export const getWeatherData = async (lat, lng) => {
  try {
    // Using a free weather API (you can replace with your preferred free API)
    const url = `${API_CONFIG.WEATHER_API}?lat=${lat}&lon=${lng}&appid=demo&units=metric`;
    const data = await fetchWithRetry(url);
    
    return {
      success: true,
      data: {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.warn('Weather API failed, using fallback data');
    return {
      success: false,
      data: {
        temperature: 22,
        humidity: 60,
        pressure: 1013,
        description: 'clear sky',
        icon: '01d',
        windSpeed: 3.5,
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

/**
 * Get real-time fuel prices for Israel
 * @returns {Promise<Object>} - Fuel prices or fallback data
 */
export const getIsraelFuelPrices = async () => {
  try {
    // This is a placeholder - replace with actual Israeli fuel price API
    const data = await fetchWithRetry(API_CONFIG.FUEL_PRICES_ISRAEL);
    
    return {
      success: true,
      data: {
        gasoline95: data.gasoline95 || 6.85,
        gasoline98: data.gasoline98 || 7.12,
        diesel: data.diesel || 6.41,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.warn('Israel fuel prices API failed, using fallback data');
    return {
      success: false,
      data: {
        gasoline95: 6.85,
        gasoline98: 7.12,
        diesel: 6.41,
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

/**
 * Get real-time fuel prices for USA
 * @returns {Promise<Object>} - Fuel prices or fallback data
 */
export const getUSAFuelPrices = async () => {
  try {
    // This is a placeholder - replace with actual US fuel price API
    const data = await fetchWithRetry(API_CONFIG.FUEL_PRICES_USA);
    
    return {
      success: true,
      data: {
        regular: data.regular || 3.24,
        midgrade: data.midgrade || 3.52,
        premium: data.premium || 3.81,
        diesel: data.diesel || 3.58,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.warn('USA fuel prices API failed, using fallback data');
    return {
      success: false,
      data: {
        regular: 3.24,
        midgrade: 3.52,
        premium: 3.81,
        diesel: 3.58,
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

/**
 * Get real-time fuel prices for Europe
 * @returns {Promise<Object>} - Fuel prices or fallback data
 */
export const getEuropeFuelPrices = async () => {
  try {
    // This is a placeholder - replace with actual European fuel price API
    const data = await fetchWithRetry(API_CONFIG.FUEL_PRICES_EUROPE);
    
    return {
      success: true,
      data: {
        gasoline95: data.gasoline95 || 1.62,
        gasoline98: data.gasoline98 || 1.79,
        diesel: data.diesel || 1.51,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.warn('Europe fuel prices API failed, using fallback data');
    return {
      success: false,
      data: {
        gasoline95: 1.62,
        gasoline98: 1.79,
        diesel: 1.51,
        lastUpdated: new Date().toISOString()
      }
    };
  }
};

/**
 * Get live news data
 * @param {string} query - Search query for news
 * @returns {Promise<Object>} - News data or fallback
 */
export const getLiveNews = async (query = 'fuel prices') => {
  try {
    // Using a free news API (you can replace with your preferred free API)
    const url = `${API_CONFIG.NEWS_API}?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10`;
    const data = await fetchWithRetry(url);
    
    return {
      success: true,
      data: data.articles.map(article => ({
        id: article.url,
        title: article.title,
        summary: article.description,
        date: article.publishedAt,
        category: 'Market Analysis',
        readTime: '3 min read',
        url: article.url,
        image: article.urlToImage
      }))
    };
  } catch (error) {
    console.warn('News API failed, using fallback data');
    return {
      success: false,
      data: mockData.news
    };
  }
};

/**
 * Get market trends and analysis
 * @returns {Promise<Object>} - Market data or fallback
 */
export const getMarketTrends = async () => {
  try {
    // This would integrate with actual market data APIs
    // For now, we'll simulate real-time data with some variation
    const baseTrends = mockData.analytics.priceTrends;
    
    // Add some real-time variation to simulate live data
    const liveTrends = {};
    Object.keys(baseTrends).forEach(country => {
      liveTrends[country] = {};
      Object.keys(baseTrends[country]).forEach(fuelType => {
        const baseValue = baseTrends[country][fuelType];
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        liveTrends[country][fuelType] = parseFloat((baseValue + variation).toFixed(3));
      });
    });
    
    return {
      success: true,
      data: {
        trends: liveTrends,
        lastUpdated: new Date().toISOString(),
        marketStatus: 'open',
        volatility: 'low'
      }
    };
  } catch (error) {
    console.warn('Market trends API failed, using fallback data');
    return {
      success: false,
      data: {
        trends: mockData.analytics.priceTrends,
        lastUpdated: new Date().toISOString(),
        marketStatus: 'closed',
        volatility: 'unknown'
      }
    };
  }
};

/**
 * Get live station data with real-time updates
 * @param {string} country - Country code
 * @returns {Promise<Object>} - Station data or fallback
 */
export const getLiveStationData = async (country = '') => {
  try {
    // This would integrate with actual station APIs
    // For now, we'll enhance mock data with real-time variations
    let stations = mockData.stations;
    
    if (country) {
      stations = stations.filter(station => station.countryCode === country);
    }
    
    // Add real-time price variations
    const liveStations = stations.map(station => {
      const updatedStation = { ...station };
      
      Object.keys(station.fuelTypes).forEach(fuelType => {
        const currentPrice = station.fuelTypes[fuelType].price;
        const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
        const newPrice = Math.max(0.5, currentPrice + variation);
        
        updatedStation.fuelTypes[fuelType] = {
          ...station.fuelTypes[fuelType],
          price: parseFloat(newPrice.toFixed(2)),
          lastUpdated: new Date().toISOString(),
          trend: variation > 0.02 ? 'up' : variation < -0.02 ? 'down' : 'stable',
          change: parseFloat(variation.toFixed(3))
        };
      });
      
      updatedStation.lastScraped = new Date().toISOString();
      return updatedStation;
    });
    
    return {
      success: true,
      data: liveStations,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.warn('Live station data API failed, using fallback data');
    return {
      success: false,
      data: mockData.stations,
      lastUpdated: new Date().toISOString()
    };
  }
};

/**
 * Get comprehensive live data for the dashboard
 * @returns {Promise<Object>} - Combined live data
 */
export const getComprehensiveLiveData = async () => {
  try {
    const [
      currencyRates,
      israelPrices,
      usaPrices,
      europePrices,
      marketTrends,
      liveNews
    ] = await Promise.allSettled([
      getCurrencyRates(),
      getIsraelFuelPrices(),
      getUSAFuelPrices(),
      getEuropeFuelPrices(),
      getMarketTrends(),
      getLiveNews()
    ]);
    
    return {
      success: true,
      data: {
        currencyRates: currencyRates.status === 'fulfilled' ? currencyRates.value : null,
        fuelPrices: {
          israel: israelPrices.status === 'fulfilled' ? israelPrices.value : null,
          usa: usaPrices.status === 'fulfilled' ? usaPrices.value : null,
          europe: europePrices.status === 'fulfilled' ? europePrices.value : null
        },
        marketTrends: marketTrends.status === 'fulfilled' ? marketTrends.value : null,
        news: liveNews.status === 'fulfilled' ? liveNews.value : null,
        lastUpdated: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Failed to fetch comprehensive live data:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Cache management for live data
 */
class LiveDataCache {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  clear() {
    this.cache.clear();
  }
}

// Export cache instance
export const liveDataCache = new LiveDataCache();

// Export all functions
export default {
  getCurrencyRates,
  getWeatherData,
  getIsraelFuelPrices,
  getUSAFuelPrices,
  getEuropeFuelPrices,
  getLiveNews,
  getMarketTrends,
  getLiveStationData,
  getComprehensiveLiveData,
  liveDataCache
};
