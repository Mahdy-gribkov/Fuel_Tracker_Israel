const cron = require('node-cron');
const puppeteer = require('puppeteer');
const Station = require('../models/Station');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Email transporter for notifications
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Sample Israeli fuel stations data (in a real app, this would be scraped from actual sources)
const sampleStations = [
  {
    name: 'Paz Tel Aviv Center',
    address: 'Rothschild Blvd 45, Tel Aviv',
    city: 'Tel Aviv',
    coordinates: { lat: 32.0853, lng: 34.7818 },
    brand: 'Paz',
    fuelTypes: {
      gasoline95: { price: 6.89, lastUpdated: new Date() },
      gasoline98: { price: 7.15, lastUpdated: new Date() },
      diesel: { price: 6.45, lastUpdated: new Date() }
    }
  },
  {
    name: 'Sonol Jerusalem',
    address: 'King George St 15, Jerusalem',
    city: 'Jerusalem',
    coordinates: { lat: 31.7683, lng: 35.2137 },
    brand: 'Sonol',
    fuelTypes: {
      gasoline95: { price: 6.95, lastUpdated: new Date() },
      gasoline98: { price: 7.25, lastUpdated: new Date() },
      diesel: { price: 6.55, lastUpdated: new Date() }
    }
  },
  {
    name: 'Delek Haifa Port',
    address: 'Haifa Port, Haifa',
    city: 'Haifa',
    coordinates: { lat: 32.7940, lng: 35.0048 },
    brand: 'Delek',
    fuelTypes: {
      gasoline95: { price: 6.75, lastUpdated: new Date() },
      gasoline98: { price: 7.05, lastUpdated: new Date() },
      diesel: { price: 6.35, lastUpdated: new Date() }
    }
  },
  {
    name: 'Dor Alon Beer Sheva',
    address: 'Ben Gurion Blvd 123, Beer Sheva',
    city: 'Beer Sheva',
    coordinates: { lat: 31.2518, lng: 34.7915 },
    brand: 'Dor Alon',
    fuelTypes: {
      gasoline95: { price: 6.65, lastUpdated: new Date() },
      gasoline98: { price: 6.95, lastUpdated: new Date() },
      diesel: { price: 6.25, lastUpdated: new Date() }
    }
  },
  {
    name: 'Tene Netanya',
    address: 'Herzl St 78, Netanya',
    city: 'Netanya',
    coordinates: { lat: 32.3215, lng: 34.8532 },
    brand: 'Tene',
    fuelTypes: {
      gasoline95: { price: 6.85, lastUpdated: new Date() },
      gasoline98: { price: 7.10, lastUpdated: new Date() },
      diesel: { price: 6.50, lastUpdated: new Date() }
    }
  }
];

// Function to scrape fuel prices (simulated with random variations)
const scrapeFuelPrices = async () => {
  console.log('🔄 Starting fuel price scraping...');
  
  try {
    // In a real implementation, you would use Puppeteer to scrape actual fuel price websites
    // For now, we'll simulate price updates with small random variations
    
    const stations = await Station.find({ isActive: true });
    
    for (const station of stations) {
      // Simulate price variations (±0.10 NIS)
      const variation = (Math.random() - 0.5) * 0.20;
      
      if (station.fuelTypes.gasoline95?.price) {
        station.fuelTypes.gasoline95.price = Math.max(6.0, 
          station.fuelTypes.gasoline95.price + variation);
        station.fuelTypes.gasoline95.lastUpdated = new Date();
      }
      
      if (station.fuelTypes.gasoline98?.price) {
        station.fuelTypes.gasoline98.price = Math.max(6.2, 
          station.fuelTypes.gasoline98.price + variation);
        station.fuelTypes.gasoline98.lastUpdated = new Date();
      }
      
      if (station.fuelTypes.diesel?.price) {
        station.fuelTypes.diesel.price = Math.max(5.8, 
          station.fuelTypes.diesel.price + variation);
        station.fuelTypes.diesel.lastUpdated = new Date();
      }
      
      station.lastScraped = new Date();
      await station.save();
    }
    
    console.log(`✅ Updated prices for ${stations.length} stations`);
    
    // Check for price alerts
    await checkPriceAlerts();
    
  } catch (error) {
    console.error('❌ Error scraping fuel prices:', error);
  }
};

// Function to check price alerts and send notifications
const checkPriceAlerts = async () => {
  try {
    const users = await User.find({ 
      'priceAlerts.isActive': true,
      'preferences.emailNotifications': true 
    }).populate('priceAlerts.stationId');
    
    for (const user of users) {
      const triggeredAlerts = [];
      
      for (const alert of user.priceAlerts) {
        if (!alert.isActive || !alert.stationId) continue;
        
        const station = alert.stationId;
        const currentPrice = station.fuelTypes[alert.fuelType]?.price;
        
        if (currentPrice && currentPrice <= alert.targetPrice) {
          // Check if we haven't already notified for this alert recently
          const lastTriggered = alert.lastTriggered;
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          
          if (!lastTriggered || lastTriggered < oneDayAgo) {
            triggeredAlerts.push({
              stationName: station.name,
              stationAddress: station.address,
              fuelType: alert.fuelType,
              currentPrice: currentPrice,
              targetPrice: alert.targetPrice
            });
            
            // Update last triggered time
            alert.lastTriggered = new Date();
          }
        }
      }
      
      // Send email notification if there are triggered alerts
      if (triggeredAlerts.length > 0) {
        await sendPriceAlertEmail(user, triggeredAlerts);
        await user.save(); // Save the updated lastTriggered times
      }
    }
    
    if (triggeredAlerts.length > 0) {
      console.log(`📧 Sent ${triggeredAlerts.length} price alert notifications`);
    }
    
  } catch (error) {
    console.error('❌ Error checking price alerts:', error);
  }
};

// Function to send price alert email
const sendPriceAlertEmail = async (user, alerts) => {
  try {
    const alertList = alerts.map(alert => `
      <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
        <h3>${alert.stationName}</h3>
        <p><strong>Address:</strong> ${alert.stationAddress}</p>
        <p><strong>Fuel Type:</strong> ${alert.fuelType}</p>
        <p><strong>Current Price:</strong> ₪${alert.currentPrice.toFixed(2)}</p>
        <p><strong>Your Target:</strong> ₪${alert.targetPrice.toFixed(2)}</p>
        <p style="color: green; font-weight: bold;">🎉 Price Alert Triggered!</p>
      </div>
    `).join('');
    
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: '⛽ Fuel Price Alert - Your Target Prices Reached!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2d3748;">⛽ Fuel Tracker Israel</h1>
          <h2>Price Alert Notification</h2>
          <p>Hello ${user.firstName},</p>
          <p>Great news! The fuel prices you're tracking have reached your target prices:</p>
          ${alertList}
          <p>Visit our website to see more details and manage your alerts.</p>
          <p>Best regards,<br>Fuel Tracker Israel Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`📧 Price alert email sent to ${user.email}`);
    
  } catch (error) {
    console.error('❌ Error sending price alert email:', error);
  }
};

// Function to initialize sample data
const initializeSampleData = async () => {
  try {
    const existingStations = await Station.countDocuments();
    
    if (existingStations === 0) {
      console.log('📊 Initializing sample station data...');
      
      for (const stationData of sampleStations) {
        const station = new Station(stationData);
        await station.save();
      }
      
      console.log(`✅ Created ${sampleStations.length} sample stations`);
    }
  } catch (error) {
    console.error('❌ Error initializing sample data:', error);
  }
};

// Schedule price scraping every 2 hours
cron.schedule('0 */2 * * *', () => {
  scrapeFuelPrices();
});

// Schedule price scraping every 30 minutes during business hours (8 AM - 8 PM)
cron.schedule('*/30 8-20 * * *', () => {
  scrapeFuelPrices();
});

// Initialize sample data on startup
initializeSampleData();

// Export functions for manual testing
module.exports = {
  scrapeFuelPrices,
  checkPriceAlerts,
  initializeSampleData
};