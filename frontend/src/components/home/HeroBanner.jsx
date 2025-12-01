import React from 'react';
import PageHero from '../layout/PageHero';
import '../../theme/tokens.css';

export default function HeroBanner({ isAuthenticated, onCTA }) {
  return (
    <PageHero
      sectionClassName="sc-hero-gradient"
      variant="default"
      title={isAuthenticated ? 'Style & Gifting Unified' : 'Shop Clothes & Gifts In One Place'}
      description="Discover curated fashion and thoughtful gifts with a sleek experience inspired by top marketplaces."
      spotlightTitle="Summer Essentials"
      spotlightSubtitle="Breezy co-ords, sun-ready layers, and thoughtful gifts curated for warm days ahead."
      tags={['Linen Layers', 'Sun-Safe Fits', 'Gift-Ready Sets']}
      cta={!isAuthenticated && (
        <button onClick={onCTA} className="sc-btn-primary text-sm md:text-base shadow-md shadow-pink-200">
          Get Started
        </button>
      )}
    />
  );
}
