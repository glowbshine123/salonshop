import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { categoryAPI } from '../utils/apiClient';
import { useLoading } from '../context/LoadingContext';
import './BecomeSeller.css';

export default function BecomeSeller() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    category: '',
    businessType: 'individual'
  });
  const { startLoading, finishLoading } = useLoading();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryAPI.getAll();
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('[BecomeSeller] Failed to load categories', err.message || err);
      } finally {
        setLoading(false);
        finishLoading();
      }
    };
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Your seller registration has been submitted! Our team will review and contact you soon.');
    setFormData({
      businessName: '',
      email: '',
      phone: '',
      category: '',
      businessType: 'individual'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Loading Registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="become-seller">
      <div className="seller-hero">
        <div className="container">
          <h1>Become a Seller</h1>
          <p>Join thousands of successful sellers on SalonPro</p>
        </div>
      </div>

      <div className="container">
        <div className="seller-content">
          <div className="seller-info">
            <h2>Why Sell on SalonPro?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon">📈</div>
                <h3>Grow Your Business</h3>
                <p>Reach thousands of salon professionals and grow your revenue</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">🛡️</div>
                <h3>Secure & Safe</h3>
                <p>100% secure transactions with buyer and seller protection</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">💳</div>
                <h3>Easy Payments</h3>
                <p>Fast payouts to your bank account every week</p>
              </div>
              <div className="benefit-card">
                <div className="benefit-icon">📊</div>
                <h3>Analytics</h3>
                <p>Detailed analytics and insights about your sales</p>
              </div>
            </div>
          </div>

          <div className="seller-form-section">
            <h2>Get Started Today</h2>
            <form className="seller-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>Business Type</label>
                <select name="businessType" value={formData.businessType} onChange={handleChange}>
                  <option value="individual">Individual/Sole Proprietor</option>
                  <option value="partnership">Partnership</option>
                  <option value="pvt">Private Limited Company</option>
                  <option value="llp">LLP</option>
                </select>
              </div>

              <div className="form-group">
                <label>Primary Category</label>
                <select name="category" value={formData.category} onChange={handleChange} required>
                  <option value="">Select a category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>


              <button type="submit" className="btn-submit">Register as Seller</button>
            </form>
          </div>
        </div>
      </div>

      <div className="seller-cta">
        <div className="container">
          <h2>Ready to Start Selling?</h2>
          <p>Join our community of successful sellers and grow your business today</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}
