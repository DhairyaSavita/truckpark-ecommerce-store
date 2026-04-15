import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChartBarIcon,
  UsersIcon,
  CubeIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  BuildingStorefrontIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
  UserCircleIcon,
  BellIcon,
  TicketIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * DashboardLayout — Shared sidebar + topbar layout for all dashboards
 * 
 * Props:
 * - navItems: Array<{ label, icon, to, badge? }>
 * - title: string (sidebar header label)
 * - accentColor: string (CSS var or hex — default 'var(--orange)')
 * - children: React node (main content)
 */
const DashboardLayout = ({
  navItems = [],
  title = 'Dashboard',
  accentColor = 'var(--orange)',
  accentColorDim = 'rgba(249,115,22,0.12)',
  accentColorRing = 'rgba(249,115,22,0.2)',
  children,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + '/');

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <div style={{
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: `linear-gradient(135deg, ${accentColor}, #FBBF24)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <TruckIcon style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          {!collapsed && (
            <div>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}>TruckParts</p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>{title}</p>
            </div>
          )}
        </Link>
        {/* Collapse btn desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost"
          style={{ padding: 6, display: 'none' }}
          id="sidebar-collapse-btn"
        >
          <Bars3Icon style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }} className="scrollbar-hide">
        {navItems.map((item, i) => {
          if (item.divider) {
            return (
              <div key={i} style={{
                padding: '12px 16px 4px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {!collapsed && item.divider}
              </div>
            );
          }
          const active = isActive(item.to);
          return (
            <Link
              key={i}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 14px',
                margin: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                color: active ? accentColor : 'var(--text-secondary)',
                background: active ? accentColorDim : 'transparent',
                border: `1px solid ${active ? accentColorRing : 'transparent'}`,
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.86rem',
                fontWeight: active ? 600 : 500,
                transition: 'all var(--transition)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'var(--bg-glass)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {item.icon && (
                <item.icon style={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  color: active ? accentColor : 'var(--text-muted)',
                }} />
              )}
              {!collapsed && (
                <>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge != null && (
                    <span style={{
                      padding: '1px 7px',
                      borderRadius: 99,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: accentColorDim,
                      color: accentColor,
                    }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '12px 8px',
        marginTop: 8,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
        }}>
          {/* Avatar */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${accentColor}, #FBBF24)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'white',
            fontFamily: "'Outfit', sans-serif",
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.name?.split(' ')[0] || 'User'}
              </p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.role || 'user'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Logout"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              borderRadius: 6,
              transition: 'color var(--transition)',
              display: 'flex',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--rose)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowRightOnRectangleIcon style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: collapsed ? 68 : 'var(--sidebar-width)',
          minHeight: '100vh',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-subtle)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 30,
          transition: 'width var(--transition)',
          overflowX: 'hidden',
        }}
        className="hidden lg:block"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        style={{
          width: 'var(--sidebar-width)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-subtle)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--transition)',
          overflowX: 'hidden',
        }}
        className="lg:hidden"
      >
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'absolute',
            top: 16,
            right: 12,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 4,
          }}
        >
          <XMarkIcon style={{ width: 20, height: 20 }} />
        </button>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          marginLeft: collapsed ? '68px' : 'var(--sidebar-width)',
          transition: 'margin-left var(--transition)',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        className="lg:ml-[var(--sidebar-width)]"
      >
        {/* Top Bar */}
        <header style={{
          height: 60,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          {/* Mobile menu btn */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <Bars3Icon style={{ width: 22, height: 22 }} />
          </button>

          <div style={{ flex: 1 }} />

          {/* Top bar actions */}
          <Link
            to="/profile"
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${accentColor}, #FBBF24)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: 'white',
              fontFamily: "'Outfit', sans-serif",
              flexShrink: 0,
            }}
            title="Profile"
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Link>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '28px 24px', animation: 'fadeSlideUp 0.4s ease-out both' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
