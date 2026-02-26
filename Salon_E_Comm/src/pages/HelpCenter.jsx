import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';
import './HelpCenter.css';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const { finishLoading } = useLoading();

  useEffect(() => {
    finishLoading();
  }, []);

  const faqCategories = {
    general: [
      {
        q: 'What is SalonPro?',
        a: 'SalonPro is a B2B marketplace connecting salon professionals with premium beauty products, tools, and supplies.'
      },
      {
        q: 'How do I create an account?',
        a: 'Click on "Login" and select "Sign Up". Fill in your details and verify your email to get started.'
      },
      {
        q: 'Is registration free?',
        a: 'Yes, registration is completely free for all customers, agents, and sellers.'
      }
    ],
    orders: [
      {
        q: 'How do I place an order?',
        a: 'Browse products, add them to your cart, and proceed to checkout. Provide your shipping details and payment method.'
      },
      {
        q: 'How long does delivery take?',
        a: 'Most orders are delivered within 3-5 business days depending on your location.'
      },
      {
        q: 'Can I cancel my order?',
        a: 'Yes, you can cancel orders within 24 hours of placement. After that, please contact our support team.'
      }
    ],
    payment: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept credit cards, debit cards, UPI, net banking, and wallet payments.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, all payments are encrypted and processed through secure payment gateways.'
      },
      {
        q: 'Can I get an invoice?',
        a: 'Yes, invoices are automatically generated and sent to your registered email after payment.'
      }
    ],
    returns: [
      {
        q: 'What is your return policy?',
        a: 'We offer 7-day returns for unused products in original packaging. Some items may have different policies.'
      },
      {
        q: 'How do I initiate a return?',
        a: 'Go to your orders, select the product, and click "Return". Follow the instructions and arrange pickup.'
      },
      {
        q: 'When will I get my refund?',
        a: 'Refunds are processed within 5-7 business days after we receive and verify your returned item.'
      }
    ]
  };

  const categories = [
    { key: 'general', label: 'General' },
    { key: 'orders', label: 'Orders' },
    { key: 'payment', label: 'Payment' },
    { key: 'returns', label: 'Returns & Refunds' }
  ];

  const currentFaqs = faqCategories[activeCategory] || [];
  const filteredFaqs = currentFaqs.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="help-center">
      <div className="help-hero">
        <div className="container">
          <h1>Help Center</h1>
          <p>Find answers to your questions and get support</p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="help-content">
          <div className="categories-sidebar">
            <h3>Categories</h3>
            <div className="categories-list">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  className={`category-btn ${activeCategory === cat.key ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="faq-section">
            <h2>{categories.find(c => c.key === activeCategory)?.label} FAQs</h2>
            <div className="faq-list">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="faq-item">
                    <h4>{faq.q}</h4>
                    <p>{faq.a}</p>
                  </div>
                ))
              ) : (
                <p className="no-results">No results found for "{searchQuery}"</p>
              )}
            </div>
          </div>
        </div>

        <div className="help-support">
          <h2>Didn't Find What You're Looking For?</h2>
          <div className="support-options">
            <div className="support-card">
              <div className="support-icon">📧</div>
              <h3>Email Support</h3>
              <p>support@salonpro.com</p>
              <button className="btn-support">Send Email</button>
            </div>
            <div className="support-card">
              <div className="support-icon">💬</div>
              <h3>Live Chat</h3>
              <p>Chat with our team 24/7</p>
              <button className="btn-support">Start Chat</button>
            </div>
            <div className="support-card">
              <div className="support-icon">📞</div>
              <h3>Phone Support</h3>
              <p>+91-XXXX-XXXX-XX</p>
              <button className="btn-support">Call Now</button>
            </div>
          </div>
        </div>
      </div>

      <div className="help-footer">
        <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );
}
