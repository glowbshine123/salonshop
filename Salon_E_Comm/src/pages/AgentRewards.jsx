import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';
import './AgentRewards.css';

export default function AgentRewards() {
  const navigate = useNavigate();
  const { finishLoading } = useLoading();

  React.useEffect(() => {
    finishLoading();
  }, []);

  const rewards = [
    {
      id: 1,
      tier: 'Bronze',
      commission: '5%',
      features: ['Up to 5 referrals/month', 'Basic dashboard', 'Email support', 'Monthly payout']
    },
    {
      id: 2,
      tier: 'Silver',
      commission: '10%',
      features: ['Unlimited referrals', 'Advanced dashboard', 'Priority support', 'Weekly payouts', 'Bonus incentives']
    },
    {
      id: 3,
      tier: 'Gold',
      commission: '15%',
      features: ['Unlimited referrals', 'Premium dashboard', '24/7 dedicated support', 'Daily payouts', 'Exclusive bonuses', 'Training program']
    }
  ];

  return (
    <div className="agent-rewards">
      <div className="rewards-hero">
        <div className="container">
          <h1>Agent Rewards Program</h1>
          <p>Earn exciting commissions and rewards for every successful referral</p>
        </div>
      </div>

      <div className="container">
        <div className="rewards-intro">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Register as an agent and get your referral link</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Share & Refer</h3>
              <p>Share your link with salon owners and professionals</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Earn Commission</h3>
              <p>Get commission on every successful referral and purchase</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Get Paid</h3>
              <p>Receive payouts directly to your bank account</p>
            </div>
          </div>
        </div>

        <div className="rewards-tiers">
          <h2>Reward Tiers</h2>
          <div className="tiers-grid">
            {rewards.map(tier => (
              <div key={tier.id} className={`tier-card ${tier.tier.toLowerCase()}`}>
                <h3>{tier.tier}</h3>
                <div className="commission">
                  <span className="rate">{tier.commission}</span>
                  <span className="label">Commission</span>
                </div>
                <ul className="features-list">
                  {tier.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
                <button className="btn-tier">Select Plan</button>
              </div>
            ))}
          </div>
        </div>

        <div className="rewards-benefits">
          <h2>Additional Benefits</h2>
          <div className="benefits-grid">
            <div className="benefit">
              <div className="benefit-icon">🎁</div>
              <h3>Monthly Bonuses</h3>
              <p>Earn extra bonuses for top performers</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">📈</div>
              <h3>Performance Incentives</h3>
              <p>Increase commission based on performance</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">🏆</div>
              <h3>Exclusive Perks</h3>
              <p>Get access to exclusive products and early deals</p>
            </div>
            <div className="benefit">
              <div className="benefit-icon">📊</div>
              <h3>Real-time Analytics</h3>
              <p>Track your referrals and earnings in real-time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rewards-cta">
        <div className="container">
          <h2>Start Earning Today</h2>
          <p>Join hundreds of agents already earning significant commissions</p>
          <button className="btn-primary" onClick={() => navigate('/auth/signin')}>Become an Agent</button>
        </div>
      </div>
    </div>
  );
}
