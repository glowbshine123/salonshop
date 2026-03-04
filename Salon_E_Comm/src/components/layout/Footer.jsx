import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../../utils/apiClient';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const footerSections = [
    {
      title: 'Shop',
      links: [
        { label: 'Hair Care', path: '/products/?category=Hair+Care&page=1' },
        { label: 'Skin Care', path: '/products/?category=Skin+Care&page=1' },
        { label: 'Equipments', path: '/products/?category=Professional+Equipment&page=1' },
        { label: 'Professional Tools', path: '/products/?category=Salon+Tools&page=1' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Contact Us', path: '/contact' },
        { label: 'About Us', path: '/about' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Use', path: '/terms' },
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Shipping Policy', path: '/shipping' },
        { label: 'Return Policy', path: '/returns' },
      ],
    },
  ];

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

  return (
    <footer className="bg-white text-neutral-900 border-t border-neutral-200 mt-auto">
      {/* Upper Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

          {/* Brand & Contact Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Logo & Name */}
            <Link to="/" className="flex items-center gap-3 group">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-black text-xl">S</span>
                </div>
              )}
              <span className="text-2xl font-black tracking-tighter text-neutral-900">
                {settings?.appName || 'Salon E-Comm'}
              </span>
            </Link>

            {/* Contact Details */}
            <div className="space-y-2 text-sm font-medium text-neutral-500">
              {settings?.supportEmail && (
                <p className='hover:text-neutral-900 transition-colors'>
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

            {/* Social Icons */}
            <div className="flex gap-4">
              {settings?.socialLinks?.facebook && (
                <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <Facebook size={24} fill="currentColor" strokeWidth={0} />
                </a>
              )}
              {settings?.socialLinks?.twitter && (
                <a href={settings.socialLinks.twitter} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <Twitter size={24} fill="currentColor" strokeWidth={0} />
                </a>
              )}
              {settings?.socialLinks?.instagram && (
                <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <Instagram size={24} fill="currentColor" stroke="white" strokeWidth={2} />
                </a>
              )}
              {settings?.socialLinks?.linkedin && (
                <a href={settings.socialLinks.linkedin} target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <Linkedin size={24} fill="currentColor" strokeWidth={0} />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-bold tracking-wide text-lg text-neutral-900">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm font-medium text-neutral-400 hover:text-neutral-900 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-100 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-col items-center gap-6">
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
            © 2026 Salon E-Comm. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
