import React, { useState, useEffect } from 'react';
import { getSettings } from '../utils/api';

interface FeatureCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, iconBg, iconColor, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-surface-container-lowest dark:bg-inverse-surface rounded-3xl signature-shadow border border-outline-variant/20 hover:shadow-md transition-shadow duration-300">
      <div className={`w-16 h-16 ${iconBg} ${iconColor} rounded-2xl flex items-center justify-center mb-6`}>
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface dark:text-on-primary-container mb-3">
        {title}
      </h3>
      <p className="text-on-surface-variant dark:text-outline-variant text-body-md leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const defaultFeatures = [
  {
    icon: 'verified',
    iconBg: 'bg-primary-fixed dark:bg-primary-container/20',
    iconColor: 'text-primary dark:text-primary-container',
    title: 'Asli Palembang',
    description: 'Diproduksi langsung di pusat kemplang Palembang dengan bahan pilihan.'
  },
  {
    icon: 'bakery_dining',
    iconBg: 'bg-secondary-fixed dark:bg-secondary-container/20',
    iconColor: 'text-secondary dark:text-secondary-container',
    title: 'Renyah & Gurih',
    description: 'Tekstur yang pas dan rasa ikan yang kuat, cocok untuk teman makan atau camilan.'
  },
  {
    icon: '',
    iconBg: 'bg-primary-fixed-dim dark:bg-primary-fixed-dim/20',
    iconColor: 'text-on-primary-fixed-variant dark:text-primary-fixed-dim',
    title: 'Halal',
    description: 'Terjamin Halal sudah dapat sertifikat halal dari MUI dan aman dikonsumsi.'
  },
  {
    icon: 'health_and_safety',
    iconBg: 'bg-surface-container-high dark:bg-outline/20',
    iconColor: 'text-on-surface-variant dark:text-outline-variant',
    title: 'Tanpa Pengawet',
    description: 'Hanya menggunakan bahan alami berkualitas tanpa tambahan bahan kimia berbahaya.'
  }
];

export const WhyUs: React.FC = () => {
  const [title, setTitle] = useState('Kenapa Harus Kami?');
  const [description, setDescription] = useState('Kami menjaga kualitas dan keaslian rasa Palembang dalam setiap butir kemplang yang kami produksi.');
  const [features, setFeatures] = useState(defaultFeatures);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        if (settings.about_title) setTitle(settings.about_title);
        if (settings.about_description) setDescription(settings.about_description);
        if (settings.about_features) {
          const parsed = JSON.parse(settings.about_features);
          const colors = [
            { bg: 'bg-primary-fixed dark:bg-primary-container/20', color: 'text-primary dark:text-primary-container' },
            { bg: 'bg-secondary-fixed dark:bg-secondary-container/20', color: 'text-secondary dark:text-secondary-container' },
            { bg: 'bg-primary-fixed-dim dark:bg-primary-fixed-dim/20', color: 'text-on-primary-fixed-variant dark:text-primary-fixed-dim' },
            { bg: 'bg-surface-container-high dark:bg-outline/20', color: 'text-on-surface-variant dark:text-outline-variant' }
          ];
          const mapped = parsed.map((item: any, idx: number) => ({
            ...item,
            iconBg: colors[idx % colors.length].bg,
            iconColor: colors[idx % colors.length].color,
          }));
          setFeatures(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch settings for WhyUs:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="tentang" className="py-24 bg-background dark:bg-on-background overflow-hidden relative transition-colors duration-300 scroll-mt-16">
      {/* Decorative Batik Background */}
      <div className="absolute inset-0 batik-overlay z-0 pointer-events-none"></div>

      {/* Header Block */}
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10 text-center mb-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-on-primary-container mb-4">
          {title}
        </h2>
        <p className="text-on-surface-variant dark:text-outline-variant max-w-xl mx-auto font-body-md">
          {description}
        </p>
      </div>

      {/* Features Grid */}
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {features.map((feat, idx) => (
          <FeatureCard
            key={idx}
            icon={feat.icon}
            iconBg={feat.iconBg}
            iconColor={feat.iconColor}
            title={feat.title}
            description={feat.description}
          />
        ))}
      </div>
    </section>
  );
};

