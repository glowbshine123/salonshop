import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../utils/apiClient';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { Button } from '../ui/button';

export default function Footer() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsAPI.get();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'Contact Us', path: '/contact' },
  ];

  const customerService = [
    { label: 'FAQ', path: '/faq' },
    { label: 'Reward Policy', path: '/reward-policy' },
    { label: 'Shipping & Returns', path: '/shipping-policy' },
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
  ];

  return (
    <footer className="w-full bg-white pb-2 pt-2">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* Main Footer Box */}
        <div
          className="relative rounded-lg overflow-hidden border border-neutral-100 shadow-md h-fit flex flex-col justify-between"
          style={{
            backgroundImage: 'url("/bg/b6.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Subtle Overlay to ensure readability if bg is too busy */}
          <div className="absolute inset-0 bg-white/20 pointer-events-none" />

          {/* Top Sections Container */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">

            {/* Brand & Contact */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3 group">
                <img src='/logo.jpeg' alt="Logo" className="w-fit h-16 rounded-md object-cover" />
              </Link>

              <div className="space-y-3 text-sm font-medium text-neutral-500">
                {settings?.supportEmail && (
                  <p className='hover:text-pink-500 transition-colors'>
                    <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
                  </p>
                )}
                {settings?.address && (
                  <p className="max-w-xs leading-relaxed">
                    {[
                      settings.address.street,
                      settings.address.city,
                      settings.address.state,
                      settings.address.zip,
                      settings.address.country
                    ].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Vertical Divider for Desktop */}
            <div className="hidden lg:block w-px h-full bg-neutral-200/50 absolute left-1/4" />

            {/* Quick Links */}
            <div className="space-y-6 lg:pl-8">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-neutral-800">Quick Links</h4>
                <div className="h-px w-full bg-neutral-200/50" />
              </div>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label} className="flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                    {link.path.startsWith('#') ? (
                      <a href={link.path} className="text-neutral-600 font-semibold hover:text-pink-500 transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.path} className="text-neutral-600 font-semibold hover:text-pink-500 transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vertical Divider for Desktop */}
            <div className="hidden lg:block w-px h-full bg-neutral-200/50 absolute left-1/2" />

            {/* Customer Service */}
            <div className="space-y-6 lg:pl-8">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-neutral-800">Customer Service</h4>
                <div className="h-px w-full bg-neutral-200/50" />
              </div>
              <ul className="space-y-3">
                {customerService.map((link) => (
                  <li key={link.label} className="flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-400 shrink-0" />
                    {link.path.startsWith('#') ? (
                      <a href={link.path} className="text-neutral-600 font-semibold hover:text-pink-500 transition-colors">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.path} className="text-neutral-600 font-semibold hover:text-pink-500 transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Vertical Divider for Desktop */}
            <div className="hidden lg:block w-px h-full bg-neutral-200/50 absolute left-3/4" />

            {/* Follow Us */}
            <div className="space-y-6 lg:pl-8">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-neutral-800">Follow Us</h4>
                <div className="h-px w-full bg-neutral-200/50" />
              </div>
              <div className="flex gap-4">
                {[
                  { icon: <Facebook size={20} />, color: 'bg-[#5B7AB7]', path: settings?.socialLinks?.facebook },
                  { icon: <Instagram size={20} />, color: 'bg-[#C25E6B]', path: settings?.socialLinks?.instagram },
                  { icon: <Twitter size={20} />, color: 'bg-[#89B1D5]', path: settings?.socialLinks?.twitter }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.path || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className={`${social.color} text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar Container */}
          <div className="relative z-10 px-10 md:px-14 pb-6 flex flex-col items-center">
            <div className="h-px w-full bg-neutral-200/30 mb-3" />
            <div className="flex flex-col md:flex-row items-center gap-2 text-sm font-medium text-neutral-500">
              <span>© {new Date().getFullYear()} {settings?.appName || 'Glow B Shine'}. All Rights Reserved.</span>
              <div className="hidden md:block w-px h-4 bg-neutral-300 mx-2" />
              <div className="flex gap-4">
                <Link to="/privacy" className="hover:text-pink-500 transition-colors">Privacy Policy</Link>
                <Link to="/shipping-policy" className="hover:text-primary transition-colors">Shipping & Returns</Link>
                <Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
