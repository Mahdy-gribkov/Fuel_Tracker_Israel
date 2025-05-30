
# ⛽ Fuel Price Tracker & Alert System

A full-stack web app that shows live fuel prices across Israel, lets users save favorite stations, set price alerts, and receive email notifications. Built for real-world use with React, Node.js, MongoDB, and Puppeteer.

---

## 🚀 Live Demo

[🔗 Live Frontend (Vercel)](https://your-vercel-app.vercel.app)  
[🔗 API Backend (Render)](https://your-backend-service.onrender.com)

---

## 🧠 Tech Stack

**Frontend:** React, React-Leaflet, Axios, Leaflet.js  
**Backend:** Node.js, Express, Puppeteer, node-cron  
**Database:** MongoDB Atlas + Mongoose  
**Auth:** JWT + bcrypt  
**Alerts:** Nodemailer (Email), OneSignal (Push - optional)  
**Hosting:** Vercel (Frontend), Render (Backend)

---

## 📂 Folder Structure

```
client/       # React frontend
server/       # Express backend
docs/         # All project phase PDFs
```

---

## 📥 Getting Started

```bash
# Clone repo
git clone https://github.com/yourusername/fuel-price-tracker.git
cd fuel-price-tracker

# Install server
cd server
npm install

# Install client
cd ../client
npm install
```

---

## 🔐 Environment Variables

Create `.env` files for both client and server:

### server/.env
```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
MAIL_USER=your_email
MAIL_PASS=your_password
```

---

## 📝 Features

- ✅ Live fuel prices from Israeli stations (via scraper)
- ✅ Interactive map with filters
- ✅ User login/signup and saved preferences
- ✅ Price alerts (email, optional push)
- ✅ Responsive design, production-ready

---

## 📊 Roadmap

- [ ] Fuel price history with graphs
- [ ] AI predictions for pricing trends
- [ ] Admin dashboard
- [ ] PWA support for mobile use

---

## 📄 Documentation

See `/docs` folder for complete project breakdown (Phases 1–5 + wrap-up).

---

## 🤝 Credits

Built by Mahdy — full-stack developer & product thinker.  
**Let's connect!** [LinkedIn](https://linkedin.com) | [Email](mailto:mahdy34552@gmail.com)

#   F u e l _ P r i c e _ T r a c k e r  
 