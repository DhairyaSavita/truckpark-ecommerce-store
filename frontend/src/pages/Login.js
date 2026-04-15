import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import TwoFactorModal from '../components/TwoFactorModal';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  TruckIcon,
  ShieldCheckIcon,
  StarIcon,
  BoltIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

/* ── Animated background mesh grid ── */
const MeshGrid = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

/* ── Feature pill ── */
const FeaturePill = ({ icon: Icon, text, delay }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      animation: `fadeSlideIn 0.5s ease-out ${delay}ms both`,
    }}
  >
    <div style={{
      width: 32,
      height: 32,
      borderRadius: 8,
      background: 'rgba(249,115,22,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon style={{ width: 16, height: 16, color: '#F97316' }} />
    </div>
    <span style={{
      fontFamily: "'Inter', sans-serif",
      fontSize: '0.82rem',
      color: 'rgba(255,255,255,0.7)',
    }}>
      {text}
    </span>
  </div>
);

const Login = () => {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [show2FAModal, setShow2FAModal]   = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      if (response.data.requiresTwoFactor) {
        setPendingUserId(response.data.userId);
        setShow2FAModal(true);
      } else {
        localStorage.setItem('token', response.data.token);
        await login(email, password);
        toast.success('Welcome back! 🎉');
        if (response.data.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASuccess = async () => {
    setShow2FAModal(false);
    await login(email, password);
    toast.success('Welcome back! 🎉');
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-page)',
    }}>
      {/* ── LEFT PANEL — Brand & Visual ── */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(160deg, #0F1623 0%, #080C14 50%, #0A0F1E 100%)',
        position: 'relative',
        overflow: 'hidden',
        display: 'none',
      }}
        className="lg:flex lg:flex-col"
      >
        {/* Grid mesh */}
        <MeshGrid />

        {/* Orange glow blob top right */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Blue glow blob bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '-80px',
          left: '-60px',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          padding: '40px 48px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'auto' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
            }}>
              <TruckIcon style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <div>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.3rem',
                fontWeight: 800,
                color: 'white',
              }}>TruckParts</p>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.7rem',
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}>Market Platform</p>
            </div>
          </div>

          {/* Hero section */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Animated truck icon */}
            <div style={{
              marginBottom: 32,
              animation: 'float 3s ease-in-out infinite',
            }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(249,115,22,0.05))',
                border: '1px solid rgba(249,115,22,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <TruckIcon style={{ width: 44, height: 44, color: '#F97316' }} />
              </div>
            </div>

            <h1 style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '2.4rem',
              fontWeight: 900,
              color: 'white',
              lineHeight: 1.15,
              marginBottom: 16,
            }}>
              India's Premier
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #F97316, #FBBF24)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Truck Parts
              </span>
              <br />
              Marketplace
            </h1>

            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 380,
            }}>
              Connect with verified sellers, logistics partners, and technicians across India.
            </p>

            {/* Feature pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              <FeaturePill icon={ShieldCheckIcon} text="Verified sellers & certified products" delay={100} />
              <FeaturePill icon={TruckIcon}       text="Real-time logistics & shipment tracking" delay={200} />
              <FeaturePill icon={BoltIcon}        text="Instant B2B quotes & bulk pricing" delay={300} />
            </div>
          </div>

          {/* Social proof */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <div style={{ display: 'flex', gap: -4 }}>
              {['#F97316','#3B82F6','#10B981','#8B5CF6'].map((c, i) => (
                <div key={i} style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${c}, ${c}88)`,
                  border: '2px solid var(--bg-card)',
                  marginLeft: i === 0 ? 0 : -8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: 'white',
                }}>
                  {['R','S','M','K'][i]}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                {[1,2,3,4,5].map(i => (
                  <StarIcon key={i} style={{ width: 12, height: 12, color: '#F59E0B', fill: '#F59E0B' }} />
                ))}
              </div>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Trusted by <strong style={{ color: 'rgba(255,255,255,0.8)' }}>50,000+</strong> workshops across India
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
      }}>
        {/* Subtle grid on mobile */}
        <div className="lg:hidden" style={{ position: 'absolute', inset: 0, opacity: 0.03 }}>
          <MeshGrid />
        </div>

        <div style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
          zIndex: 2,
          animation: 'fadeSlideUp 0.5s ease-out both',
        }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 32,
            justifyContent: 'center',
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TruckIcon style={{ width: 22, height: 22, color: 'white' }} />
            </div>
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}>TruckParts Market</p>
          </div>

          {/* Form card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 32px',
            boxShadow: 'var(--shadow-card), 0 0 60px rgba(249,115,22,0.05)',
          }}>
            {/* Heading */}
            <div style={{ marginBottom: 28 }}>
              <h2 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: 6,
              }}>
                Welcome back
              </h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
              }}>
                Sign in to your TruckParts account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Email */}
              <div>
                <label className="input-label" htmlFor="login-email">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <EnvelopeIcon style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 18,
                    height: 18,
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-dark"
                    placeholder="you@example.com"
                    required
                    style={{ paddingLeft: 42 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="input-label" htmlFor="login-password" style={{ margin: 0 }}>Password</label>
                  <Link to="/forgot-password" style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '0.78rem',
                    color: 'var(--orange)',
                    textDecoration: 'none',
                  }}>
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <LockClosedIcon style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 18,
                    height: 18,
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }} />
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-dark"
                    placeholder="••••••••"
                    required
                    style={{ paddingLeft: 42, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 0,
                      display: 'flex',
                    }}
                  >
                    {showPass
                      ? <EyeSlashIcon style={{ width: 18, height: 18 }} />
                      : <EyeIcon style={{ width: 18, height: 18 }} />
                    }
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                id="login-submit-btn"
                style={{
                  width: '100%',
                  padding: '13px 24px',
                  fontSize: '0.95rem',
                  marginTop: 4,
                  justifyContent: 'center',
                }}
              >
                {loading ? (
                  <>
                    <svg style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                    Signing in…
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                New here?
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            </div>

            {/* Register link */}
            <Link
              to="/register"
              className="btn-secondary"
              style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '12px 24px' }}
            >
              Create an Account
            </Link>
          </div>

          {/* Bottom note */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            marginTop: 20,
            lineHeight: 1.7,
          }}>
            By signing in you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <TwoFactorModal
          userId={pendingUserId}
          onSuccess={handle2FASuccess}
          onCancel={() => setShow2FAModal(false)}
        />
      )}
    </div>
  );
};

export default Login;
