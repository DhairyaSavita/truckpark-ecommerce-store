import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

/**
 * StatCard — Universal stat display card for all dashboards
 * 
 * Props:
 * - title: string
 * - value: string | number
 * - icon: React component (HeroIcon)
 * - variant: 'orange' | 'blue' | 'emerald' | 'amber' | 'violet' | 'rose'
 * - trend: { value: number, label: string } (optional)
 * - prefix: string (e.g. '₹', '$')
 * - suffix: string (e.g. 'units')
 * - onClick: function (optional — makes card clickable)
 * - delay: number (animation delay in ms, default 0)
 */
const VARIANT_CONFIG = {
  orange: {
    icon_bg:    'rgba(249, 115, 22, 0.12)',
    icon_color: '#F97316',
    glow:       'rgba(249, 115, 22, 0.12)',
    ring:       'rgba(249, 115, 22, 0.2)',
    text:       '#F97316',
    gradient:   'linear-gradient(135deg, #F97316, #FBBF24)',
  },
  blue: {
    icon_bg:    'rgba(59, 130, 246, 0.12)',
    icon_color: '#3B82F6',
    glow:       'rgba(59, 130, 246, 0.12)',
    ring:       'rgba(59, 130, 246, 0.2)',
    text:       '#3B82F6',
    gradient:   'linear-gradient(135deg, #3B82F6, #06B6D4)',
  },
  emerald: {
    icon_bg:    'rgba(16, 185, 129, 0.12)',
    icon_color: '#10B981',
    glow:       'rgba(16, 185, 129, 0.12)',
    ring:       'rgba(16, 185, 129, 0.2)',
    text:       '#10B981',
    gradient:   'linear-gradient(135deg, #10B981, #34D399)',
  },
  amber: {
    icon_bg:    'rgba(245, 158, 11, 0.12)',
    icon_color: '#F59E0B',
    glow:       'rgba(245, 158, 11, 0.12)',
    ring:       'rgba(245, 158, 11, 0.2)',
    text:       '#F59E0B',
    gradient:   'linear-gradient(135deg, #F59E0B, #FCD34D)',
  },
  violet: {
    icon_bg:    'rgba(139, 92, 246, 0.12)',
    icon_color: '#8B5CF6',
    glow:       'rgba(139, 92, 246, 0.12)',
    ring:       'rgba(139, 92, 246, 0.2)',
    text:       '#8B5CF6',
    gradient:   'linear-gradient(135deg, #8B5CF6, #EC4899)',
  },
  rose: {
    icon_bg:    'rgba(244, 63, 94, 0.12)',
    icon_color: '#F43F5E',
    glow:       'rgba(244, 63, 94, 0.12)',
    ring:       'rgba(244, 63, 94, 0.2)',
    text:       '#F43F5E',
    gradient:   'linear-gradient(135deg, #F43F5E, #FB7185)',
  },
  cyan: {
    icon_bg:    'rgba(6, 182, 212, 0.12)',
    icon_color: '#06B6D4',
    glow:       'rgba(6, 182, 212, 0.12)',
    ring:       'rgba(6, 182, 212, 0.2)',
    text:       '#06B6D4',
    gradient:   'linear-gradient(135deg, #06B6D4, #3B82F6)',
  },
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  variant = 'orange',
  trend,
  prefix = '',
  suffix = '',
  onClick,
  delay = 0,
  loading = false,
}) => {
  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.orange;

  if (loading) {
    return (
      <div
        className="card-dark p-6"
        style={{ animation: `fadeSlideUp 0.4s ease-out ${delay}ms both` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton-dark h-4 w-24 rounded" />
          <div className="skeleton-dark w-12 h-12 rounded-xl" />
        </div>
        <div className="skeleton-dark h-8 w-20 rounded mt-2" />
        <div className="skeleton-dark h-3 w-16 rounded mt-3" />
      </div>
    );
  }

  return (
    <div
      className={`card-dark p-6 group${onClick ? ' cursor-pointer' : ''}`}
      onClick={onClick}
      style={{
        animation: `fadeSlideUp 0.4s ease-out ${delay}ms both`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle gradient corner accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--radius)',
          background: `radial-gradient(ellipse at top right, ${config.glow} 0%, transparent 60%)`,
          opacity: 0,
          transition: 'opacity var(--transition)',
          pointerEvents: 'none',
        }}
        className="group-hover:!opacity-100"
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {title}
          </p>
          {Icon && (
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: config.icon_bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${config.ring}`,
              flexShrink: 0,
            }}>
              <Icon style={{ width: 22, height: 22, color: config.icon_color }} />
            </div>
          )}
        </div>

        {/* Value */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          lineHeight: 1,
          animation: `countUp 0.5s ease-out ${delay + 100}ms both`,
        }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: config.text, marginRight: 2 }}>
            {prefix}
          </span>
          {typeof value === 'number' ? value.toLocaleString('en-IN') : value}
          {suffix && (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              {suffix}
            </span>
          )}
        </p>

        {/* Trend */}
        {trend && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            marginTop: 10,
          }}>
            {trend.value >= 0 ? (
              <ArrowTrendingUpIcon style={{ width: 14, height: 14, color: 'var(--emerald)' }} />
            ) : (
              <ArrowTrendingDownIcon style={{ width: 14, height: 14, color: 'var(--rose)' }} />
            )}
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: trend.value >= 0 ? 'var(--emerald)' : 'var(--rose)',
            }}>
              {trend.value >= 0 ? '+' : ''}{trend.value}%
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
