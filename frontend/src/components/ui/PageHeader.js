import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

/**
 * PageHeader — Consistent page header for all dashboard pages
 * 
 * Props:
 * - title: string
 * - subtitle: string (optional)
 * - breadcrumbs: Array<{ label: string, to?: string }> (optional)
 * - actions: React node (optional — rendered on right side)
 * - badge: { label: string, variant: string } (optional)
 * - icon: React component (HeroIcon) (optional, shown left of title)
 * - gradient: boolean (default false) — makes title text gradient-orange
 */
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  badge,
  icon: Icon,
  gradient = false,
}) => {
  return (
    <div
      style={{
        marginBottom: 28,
        animation: 'fadeSlideUp 0.4s ease-out both',
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 12,
        }}>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    transition: 'color var(--transition)',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '0.78rem',
                  color: i === breadcrumbs.length - 1 ? 'var(--text-secondary)' : 'var(--text-muted)',
                  fontWeight: i === breadcrumbs.length - 1 ? 600 : 400,
                }}>
                  {crumb.label}
                </span>
              )}
              {i < breadcrumbs.length - 1 && (
                <ChevronRightIcon style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Main row */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        {/* Left: Icon + Title + Subtitle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {Icon && (
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'rgba(249,115,22,0.12)',
              border: '1px solid rgba(249,115,22,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 2,
            }}>
              <Icon style={{ width: 24, height: 24, color: 'var(--orange)' }} />
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.65rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.2,
                ...(gradient && {
                  background: 'linear-gradient(135deg, #F97316, #FBBF24)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }),
              }}>
                {title}
              </h1>
              {badge && (
                <span className={`badge badge-${badge.variant || 'orange'}`}>
                  {badge.label}
                </span>
              )}
            </div>
            {subtitle && (
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginTop: 4,
                lineHeight: 1.5,
              }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
