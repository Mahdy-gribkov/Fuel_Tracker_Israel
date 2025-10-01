import { faker } from '@faker-js/faker';

// Generate comprehensive mock data for global fuel stations
const generateMockStations = () => {
  const countries = {
    israel: {
      name: 'Israel',
      cities: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Beer Sheva', 'Netanya', 'Ashdod', 'Rishon LeZion', 'Petah Tikva', 'Holon', 'Bnei Brak'],
      brands: ['Paz', 'Sonol', 'Delek', 'Dor Alon', 'Tene'],
      currency: '₪',
      fuelTypes: {
        gasoline95: { name: '95 Octane', basePrice: 6.8, variation: 0.3 },
        gasoline98: { name: '98 Octane', basePrice: 7.1, variation: 0.3 },
        diesel: { name: 'Diesel', basePrice: 6.4, variation: 0.3 }
      }
    },
    usa: {
      name: 'United States',
      cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington'],
      brands: ['Shell', 'Exxon', 'Chevron', 'BP', 'Mobil', '76', 'ARCO', 'Valero', 'Sunoco', 'Citgo'],
      currency: '$',
      fuelTypes: {
        regular: { name: 'Regular', basePrice: 3.2, variation: 0.4 },
        midgrade: { name: 'Midgrade', basePrice: 3.5, variation: 0.4 },
        premium: { name: 'Premium', basePrice: 3.8, variation: 0.4 },
        diesel: { name: 'Diesel', basePrice: 3.6, variation: 0.4 }
      }
    },
    europe: {
      name: 'Europe',
      cities: ['London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Prague', 'Warsaw', 'Budapest', 'Barcelona', 'Munich', 'Milan', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen'],
      brands: ['Shell', 'BP', 'Total', 'Eni', 'Repsol', 'OMV', 'Aral', 'Esso', 'Jet', 'Q8'],
      currency: '€',
      fuelTypes: {
        gasoline95: { name: '95 Octane', basePrice: 1.6, variation: 0.2 },
        gasoline98: { name: '98 Octane', basePrice: 1.8, variation: 0.2 },
        diesel: { name: 'Diesel', basePrice: 1.5, variation: 0.2 }
      }
    }
  };

  const stations = [];
  let stationId = 1;

  Object.entries(countries).forEach(([countryCode, country]) => {
    country.cities.forEach(city => {
      const stationsPerCity = Math.floor(Math.random() * 15) + 10; // 10-25 stations per city
      
      for (let i = 0; i < stationsPerCity; i++) {
        const brand = faker.helpers.arrayElement(country.brands);
        const station = {
          _id: `station_${stationId++}`,
          name: `${brand} ${city} ${faker.helpers.arrayElement(['Center', 'Express', 'Plus', 'Super', 'Mega', 'Ultra', 'Pro', 'Max'])}`,
          address: faker.address.streetAddress(),
          city: city,
          country: country.name,
          countryCode: countryCode,
          coordinates: {
            lat: faker.address.latitude(30, 60),
            lng: faker.address.longitude(-10, 40)
          },
          brand: brand,
          fuelTypes: {},
          services: faker.helpers.arrayElements([
            'Car Wash', 'Convenience Store', 'ATM', 'Restaurant', 'Air Pump', 
            'Tire Service', 'Oil Change', 'Car Repair', '24/7 Service', 'WiFi'
          ], { min: 2, max: 6 }),
          openingHours: {
            monday: '06:00-22:00',
            tuesday: '06:00-22:00',
            wednesday: '06:00-22:00',
            thursday: '06:00-22:00',
            friday: '06:00-22:00',
            saturday: '07:00-21:00',
            sunday: '08:00-20:00'
          },
          rating: faker.datatype.float({ min: 3.0, max: 5.0, precision: 0.1 }),
          reviewCount: faker.datatype.number({ min: 10, max: 500 }),
          isActive: true,
          lastScraped: faker.date.recent(1),
          createdAt: faker.date.past(2),
          updatedAt: faker.date.recent(1)
        };

        // Generate fuel prices with realistic variations
        Object.entries(country.fuelTypes).forEach(([fuelType, config]) => {
          const basePrice = config.basePrice;
          const variation = (Math.random() - 0.5) * config.variation;
          const price = Math.max(0.5, basePrice + variation);
          
          station.fuelTypes[fuelType] = {
            price: parseFloat(price.toFixed(2)),
            lastUpdated: faker.date.recent(0.5),
            trend: faker.helpers.arrayElement(['up', 'down', 'stable']),
            change: parseFloat(((Math.random() - 0.5) * 0.1).toFixed(3))
          };
        });

        stations.push(station);
      }
    });
  });

  return stations;
};

// Generate price history data
const generatePriceHistory = (stationId, fuelType, days = 30) => {
  const history = [];
  const basePrice = faker.datatype.float({ min: 1.0, max: 8.0, precision: 0.01 });
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const variation = (Math.random() - 0.5) * 0.2;
    const price = Math.max(0.5, basePrice + variation);
    
    history.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
      volume: faker.datatype.number({ min: 100, max: 1000 })
    });
  }
  
  return history;
};

// Generate user analytics data
const generateAnalytics = () => {
  return {
    totalStations: 2847,
    totalUsers: 45632,
    totalAlerts: 12847,
    averagePrice: {
      israel: { gasoline95: 6.85, gasoline98: 7.12, diesel: 6.41 },
      usa: { regular: 3.24, midgrade: 3.52, premium: 3.81, diesel: 3.58 },
      europe: { gasoline95: 1.62, gasoline98: 1.79, diesel: 1.51 }
    },
    priceTrends: {
      israel: { gasoline95: -0.02, gasoline98: -0.01, diesel: -0.03 },
      usa: { regular: 0.05, midgrade: 0.04, premium: 0.06, diesel: 0.03 },
      europe: { gasoline95: 0.01, gasoline98: 0.02, diesel: 0.00 }
    },
    topStations: [
      { name: 'Shell Times Square', city: 'New York', rating: 4.8, reviewCount: 1247 },
      { name: 'BP Champs-Élysées', city: 'Paris', rating: 4.7, reviewCount: 892 },
      { name: 'Paz Dizengoff Center', city: 'Tel Aviv', rating: 4.6, reviewCount: 634 }
    ]
  };
};

// Generate news and updates
const generateNews = () => {
  return [
    {
      id: 1,
      title: 'Global Fuel Prices Show Mixed Trends in Q4 2024',
      summary: 'European markets see slight increases while US prices stabilize after recent volatility.',
      date: '2024-01-15',
      category: 'Market Analysis',
      readTime: '3 min read'
    },
    {
      id: 2,
      title: 'New Shell Station Opens in Downtown Berlin',
      summary: 'State-of-the-art facility features electric vehicle charging and premium services.',
      date: '2024-01-14',
      category: 'Station News',
      readTime: '2 min read'
    },
    {
      id: 3,
      title: 'Israel Implements New Fuel Tax Structure',
      summary: 'Changes expected to impact prices across all major fuel types starting next month.',
      date: '2024-01-13',
      category: 'Policy Update',
      readTime: '4 min read'
    },
    {
      id: 4,
      title: 'Electric Vehicle Charging Network Expands in California',
      summary: 'Major oil companies invest heavily in EV infrastructure across the state.',
      date: '2024-01-12',
      category: 'Technology',
      readTime: '5 min read'
    }
  ];
};

// Generate user testimonials
const generateTestimonials = () => {
  return [
    {
      id: 1,
      name: 'Sarah Chen',
      location: 'San Francisco, CA',
      rating: 5,
      text: 'This app saved me over $200 last month by finding the cheapest gas stations on my commute route!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'David Müller',
      location: 'Berlin, Germany',
      rating: 5,
      text: 'The price alerts are incredibly accurate. I always know when to fill up for the best deals.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Rachel Cohen',
      location: 'Tel Aviv, Israel',
      rating: 5,
      text: 'Perfect for finding the best fuel prices in Israel. The map feature is especially helpful.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];
};

export const mockData = {
  stations: generateMockStations(),
  priceHistory: generatePriceHistory,
  analytics: generateAnalytics(),
  news: generateNews(),
  testimonials: generateTestimonials()
};

export default mockData;
