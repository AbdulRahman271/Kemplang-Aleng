import React, { useState, useEffect } from 'react';
import { testimonials as staticTestimonials } from '../data/testimonials';
import { Review } from '@kemplang/types';
import { getReviews } from '../utils/api';

export const Testimonials: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews();
        if (data && data.length > 0) {
          setReviewsList(data);
        } else {
          setReviewsList(staticTestimonials);
        }
      } catch (err) {
        console.error('Failed to load testimonials:', err);
        setReviewsList(staticTestimonials);
      }
    };
    fetchReviews();
  }, []);

  // Helper to render star elements dynamically
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span
            key={i}
            className="material-symbols-outlined text-secondary dark:text-secondary-fixed-dim"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        );
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <span
            key={i}
            className="material-symbols-outlined text-secondary dark:text-secondary-fixed-dim"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star_half
          </span>
        );
      } else {
        stars.push(
          <span
            key={i}
            className="material-symbols-outlined text-outline-variant/50"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            star
          </span>
        );
      }
    }
    return stars;
  };

  const isHexColor = (color: string) => color && color.startsWith('#');

  return (
    <section className="py-24 bg-surface-container-highest dark:bg-inverse-surface/40 transition-colors duration-300">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        
        {/* Title */}
        <h2 className="font-headline-lg text-headline-lg text-center text-on-surface dark:text-on-primary-container mb-16">
          Apa Kata Pelanggan Setia?
        </h2>

        {/* Grid of Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {reviewsList.map((rev) => {
            const avatarStyle = isHexColor(rev.avatarBg)
              ? { backgroundColor: rev.avatarBg, color: rev.avatarColor }
              : {};
            const avatarClass = isHexColor(rev.avatarBg)
              ? "w-12 h-12 rounded-full flex items-center justify-center font-bold select-none shadow-sm"
              : `w-12 h-12 rounded-full ${rev.avatarBg} ${rev.avatarColor} flex items-center justify-center font-bold select-none shadow-sm`;

            return (
              <div
                key={rev.id}
                className="bg-surface dark:bg-inverse-surface p-8 rounded-2xl signature-shadow relative flex flex-col justify-between border border-outline-variant/10"
              >
                {/* Star Rating */}
                <div>
                  <div className="flex text-secondary mb-4 select-none">
                    {renderStars(rev.rating)}
                  </div>
                  <p className="text-on-surface dark:text-on-primary-container italic mb-6 leading-relaxed">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>

                {/* Customer Avatar & Bio */}
                <div className="flex items-center gap-4 mt-auto">
                  <div
                    className={avatarClass}
                    style={avatarStyle}
                  >
                    {rev.initial}
                  </div>
                  <div>
                    <h4 className="font-label-md text-on-surface dark:text-on-primary-container leading-tight">
                      {rev.name}
                    </h4>
                    <p className="text-label-sm text-on-surface-variant dark:text-outline-variant mt-0.5">
                      {rev.role}
                    </p>
                  </div>
                </div>

                {/* Decorative Quote Icon */}
                <span className="absolute top-8 right-8 material-symbols-outlined text-outline-variant/20 dark:text-outline/10 text-6xl opacity-30 select-none pointer-events-none">
                  format_quote
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
