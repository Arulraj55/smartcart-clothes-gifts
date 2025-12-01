import React from 'react';
import '../../theme/tokens.css';

const VARIANT_STYLES = {
  default: {
    background: null,
    topGlow: 'rgba(244, 114, 182, 0.32)',
    bottomGlow: 'rgba(252, 231, 243, 0.6)',
    accent: '#ec4899',
    heading: '#111827',
    description: '#4b5563',
    cardBg: 'rgba(255,255,255,0.85)',
    cardHeading: '#111827',
    cardText: '#6b7280',
    tagBg: 'rgba(253, 242, 248, 1)',
    tagText: '#ec4899'
  },
  clothes: {
    background: '#f8fafc',
    topGlow: 'rgba(59, 130, 246, 0.32)',
    bottomGlow: 'rgba(125, 211, 252, 0.45)',
    accent: '#2563eb',
    heading: '#0f172a',
    description: '#475569',
    cardBg: 'rgba(255,255,255,0.9)',
    cardHeading: '#0f172a',
    cardText: '#475569',
    tagBg: 'rgba(239, 246, 255, 1)',
    tagText: '#2563eb'
  },
  gifts: {
    background: '#fff7ed',
    topGlow: 'rgba(249, 115, 22, 0.28)',
    bottomGlow: 'rgba(253, 224, 171, 0.6)',
    accent: '#f97316',
    heading: '#111827',
    description: '#4b5563',
    cardBg: 'rgba(255,255,255,0.9)',
    cardHeading: '#0f172a',
    cardText: '#475569',
    tagBg: 'rgba(255, 247, 237, 1)',
    tagText: '#f97316'
  }
};

const Section = ({
  className,
  style,
  children
}) => (
  <section className={className} style={style}>
    {children}
  </section>
);

export default function PageHero({
  title,
  description,
  spotlightTitle,
  spotlightSubtitle,
  tags = [],
  eyebrow = 'Trending Now',
  variant = 'default',
  fullBleed = false,
  sectionClassName = '',
  containerClassName = '',
  cta = null
}) {
  const palette = VARIANT_STYLES[variant] || VARIANT_STYLES.default;

  const sectionStyles = {
    ...(palette.background ? { background: palette.background } : {}),
    ...(fullBleed ? {
      width: '100vw',
      position: 'relative',
      left: '50%',
      marginLeft: '-50vw',
      marginRight: '-50vw'
    } : {})
  };

  const sectionClasses = ['border-b border-gray-100', sectionClassName].filter(Boolean).join(' ');
  const containerClasses = ['sc-container py-12 md:py-20 grid md:grid-cols-2 gap-10 items-center', containerClassName].filter(Boolean).join(' ');

  return (
    <Section className={sectionClasses} style={sectionStyles}>
      <div className={containerClasses}>
        <div className="flex flex-col gap-5">
          <h1
            className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
            style={{ color: palette.heading }}
          >
            {title}
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: palette.description }}
          >
            {description}
          </p>
          {cta && (
            <div className="pt-2">
              {cta}
            </div>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          <div
            className="absolute -top-10 -left-6 w-40 h-40 rounded-full blur-3xl hidden lg:block"
            style={{ background: palette.topGlow }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-12 -right-4 w-44 h-44 rounded-full blur-3xl hidden md:block"
            style={{ background: palette.bottomGlow }}
            aria-hidden="true"
          />

          <div
            className="relative rounded-[32px] px-10 py-14 text-center flex flex-col items-center gap-4 max-w-sm w-full shadow-xl"
            style={{
              background: palette.cardBg,
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 25px 50px -25px rgba(15, 23, 42, 0.35)'
            }}
          >
            <span
              className="uppercase text-[0.65rem] tracking-[0.45em] font-semibold"
              style={{ color: palette.accent }}
            >
              {eyebrow}
            </span>
            <h3
              className="text-3xl md:text-4xl font-black"
              style={{ color: palette.cardHeading }}
            >
              {spotlightTitle}
            </h3>
            <p
              className="text-sm md:text-base leading-relaxed max-w-[240px]"
              style={{ color: palette.cardText }}
            >
              {spotlightSubtitle}
            </p>
            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                    style={{
                      background: palette.tagBg,
                      color: palette.tagText
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
