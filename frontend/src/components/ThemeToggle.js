import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle — Animated pill toggle with sun/moon, sliding knob & glow
 * 
 * Props:
 *   compact: boolean — slim icon-only variant for tighter spaces (default false)
 */
const ThemeToggle = ({ compact = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 0 : 8,
        padding: compact ? '5px' : '5px 14px 5px 6px',
        background: isDark
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.06)',
        border: isDark
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(0,0,0,0.1)',
        borderRadius: 99,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        outline: 'none',
        overflow: 'hidden',
        minWidth: compact ? 36 : 'auto',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDark
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = isDark
          ? 'rgba(255,255,255,0.2)'
          : 'rgba(0,0,0,0.2)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isDark
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = isDark
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.1)';
      }}
    >
      {/* Knob (slides left/right) */}
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark
            ? 'linear-gradient(135deg, #1E293B, #334155)'
            : 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          boxShadow: isDark
            ? '0 0 10px rgba(139,92,246,0.4), 0 2px 8px rgba(0,0,0,0.4)'
            : '0 0 12px rgba(251,191,36,0.6), 0 2px 8px rgba(0,0,0,0.15)',
          transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isDark ? (
          /* Moon icon */
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: 13, height: 13, color: '#A78BFA', transition: 'all 0.3s ease' }}
          >
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ) : (
          /* Sun icon */
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ width: 13, height: 13, color: '#D97706', transition: 'all 0.3s ease' }}
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Label — hidden in compact mode */}
      {!compact && (
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.78rem',
            fontWeight: 600,
            color: isDark ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.6)',
            letterSpacing: '0.01em',
            transition: 'color 0.3s ease',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

/**
 * ThemeToggleSwitch — The classic iOS-style pill track with sliding knob
 * Best for Settings pages / sidebar footers
 */
export const ThemeToggleSwitch = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {/* Track */}
      <div
        style={{
          position: 'relative',
          width: 52,
          height: 28,
          borderRadius: 99,
          background: isDark
            ? 'linear-gradient(135deg, #312E81, #4C1D95)'
            : 'linear-gradient(135deg, #FDE68A, #F59E0B)',
          boxShadow: isDark
            ? 'inset 0 2px 6px rgba(0,0,0,0.4), 0 0 14px rgba(139,92,246,0.3)'
            : 'inset 0 2px 6px rgba(0,0,0,0.1), 0 0 14px rgba(251,191,36,0.3)',
          transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
          border: isDark
            ? '1px solid rgba(139,92,246,0.3)'
            : '1px solid rgba(251,191,36,0.4)',
          flexShrink: 0,
        }}
      >
        {/* Stars (dark mode decoration) */}
        {isDark && (
          <>
            <div style={{ position: 'absolute', top: 5, left: 7, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
            <div style={{ position: 'absolute', top: 11, left: 14, width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
            <div style={{ position: 'absolute', top: 7, left: 19, width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
          </>
        )}
        {/* Sun rays (light mode) */}
        {!isDark && (
          <div style={{ position: 'absolute', top: 5, right: 8, width: 14, height: 14, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
          </div>
        )}

        {/* Knob */}
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: isDark ? 3 : 25,
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'left 0.35s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" fill="#7C3AED" style={{ width: 12, height: 12 }}>
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="#D97706" style={{ width: 12, height: 12 }}>
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '0.82rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        userSelect: 'none',
      }}>
        {isDark ? 'Dark Mode' : 'Light Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;
