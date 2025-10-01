import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [favoriteStations, setFavoriteStations] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAlert, setNewAlert] = useState({
    stationId: '',
    fuelType: 'gasoline95',
    targetPrice: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const [favoritesResponse, alertsResponse] = await Promise.all([
        axios.get('/api/users/favorites'),
        axios.get('/api/users/alerts')
      ]);
      
      setFavoriteStations(favoritesResponse.data);
      setPriceAlerts(alertsResponse.data);
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (stationId) => {
    try {
      await axios.post('/api/users/favorites', { stationId });
      toast.success('Added to favorites');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to add to favorites');
    }
  };

  const removeFromFavorites = async (stationId) => {
    try {
      await axios.delete(`/api/users/favorites/${stationId}`);
      toast.success('Removed from favorites');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const createPriceAlert = async (e) => {
    e.preventDefault();
    
    if (!newAlert.stationId || !newAlert.targetPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await axios.post('/api/users/alerts', newAlert);
      toast.success('Price alert created');
      setNewAlert({ stationId: '', fuelType: 'gasoline95', targetPrice: '' });
      fetchUserData();
    } catch (error) {
      toast.error('Failed to create price alert');
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      await axios.delete(`/api/users/alerts/${alertId}`);
      toast.success('Alert deleted');
      fetchUserData();
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  const formatPrice = (price) => {
    return price ? `₪${price.toFixed(2)}` : 'N/A';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Welcome back, {user.firstName}!</h1>
        <p style={{ color: '#718096' }}>Manage your favorite stations and price alerts</p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>
        {/* Favorite Stations */}
        <div>
          <h2>Favorite Stations ({favoriteStations.length})</h2>
          <div style={{ marginTop: '1rem' }}>
            {favoriteStations.length === 0 ? (
              <p style={{ color: '#718096', fontStyle: 'italic' }}>
                No favorite stations yet. Add some from the home page!
              </p>
            ) : (
              favoriteStations.map(station => (
                <div key={station._id} className="station-card">
                  <div className="station-name">{station.name}</div>
                  <div className="station-address">{station.address}, {station.city}</div>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ 
                      background: '#e2e8f0', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem',
                      fontSize: '0.875rem'
                    }}>
                      {station.brand}
                    </span>
                  </div>
                  <div className="fuel-prices">
                    <div className="fuel-price">
                      <div className="fuel-type">95 Octane</div>
                      <div className="price">{formatPrice(station.fuelTypes.gasoline95?.price)}</div>
                    </div>
                    <div className="fuel-price">
                      <div className="fuel-type">98 Octane</div>
                      <div className="price">{formatPrice(station.fuelTypes.gasoline98?.price)}</div>
                    </div>
                    <div className="fuel-price">
                      <div className="fuel-type">Diesel</div>
                      <div className="price">{formatPrice(station.fuelTypes.diesel?.price)}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromFavorites(station._id)}
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem' }}
                  >
                    Remove from Favorites
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Price Alerts */}
        <div>
          <h2>Price Alerts ({priceAlerts.length})</h2>
          
          {/* Create New Alert Form */}
          <div className="station-card" style={{ marginTop: '1rem' }}>
            <h3>Create New Alert</h3>
            <form onSubmit={createPriceAlert}>
              <div className="form-group">
                <label className="form-label">Station</label>
                <select
                  value={newAlert.stationId}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, stationId: e.target.value }))}
                  className="form-input"
                  required
                >
                  <option value="">Select a station</option>
                  {favoriteStations.map(station => (
                    <option key={station._id} value={station._id}>
                      {station.name} - {station.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  value={newAlert.fuelType}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, fuelType: e.target.value }))}
                  className="form-input"
                >
                  <option value="gasoline95">95 Octane</option>
                  <option value="gasoline98">98 Octane</option>
                  <option value="diesel">Diesel</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Price (₪)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAlert.targetPrice}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                  className="form-input"
                  placeholder="Enter target price"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Create Alert
              </button>
            </form>
          </div>

          {/* Existing Alerts */}
          <div style={{ marginTop: '1rem' }}>
            {priceAlerts.length === 0 ? (
              <p style={{ color: '#718096', fontStyle: 'italic' }}>
                No price alerts yet. Create one above!
              </p>
            ) : (
              priceAlerts.map(alert => (
                <div key={alert._id} className="station-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div className="station-name">{alert.stationId.name}</div>
                      <div className="station-address">{alert.stationId.address}, {alert.stationId.city}</div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <span style={{ 
                          background: '#e2e8f0', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          marginRight: '0.5rem'
                        }}>
                          {alert.fuelType === 'gasoline95' ? '95 Octane' : 
                           alert.fuelType === 'gasoline98' ? '98 Octane' : 'Diesel'}
                        </span>
                        <span style={{ fontWeight: '600' }}>
                          Alert when price ≤ ₪{alert.targetPrice}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>
                        Status: {alert.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteAlert(alert._id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
