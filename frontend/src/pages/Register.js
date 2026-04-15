import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  TruckIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const MeshGrid = () => (
  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid2)" />
  </svg>
);

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number', ok: /[0-9]/.test(password) },
    { label: 'Special character', ok: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ['#F43F5E', '#F59E0B', '#10B981', '#10B981'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= score ? colors[score - 1] : 'var(--border-medium)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {checks.map((c, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: "'Inter', sans-serif", fontSize: '0.72rem',
            color: c.ok ? 'var(--emerald)' : 'var(--text-muted)',
            transition: 'color 0.2s ease',
          }}>
            <CheckCircleIcon style={{ width: 11, height: 11 }} />
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
};

const FormField = ({ label, id, icon: Icon, children, hint }) => (
  <div>
    <label className="input-label" htmlFor={id}>{label}</label>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon style={{
          position: 'absolute', left: 14, top: '50%',
          transform: 'translateY(-50%)',
          width: 18, height: 18, color: 'var(--text-muted)', pointerEvents: 'none',
        }} />
      )}
      {children}
    </div>
    {hint && (
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
        {hint}
      </p>
    )}
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await authAPI.register({
        name: formData.name, email: formData.email,
        password: formData.password, phone: formData.phone, address: formData.address,
      });
      localStorage.setItem('token', response.data.token);
      await login(formData.email, formData.password);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-page)' }}>
      {/* LEFT PANEL */}
      <div
        style={{
          flex: '0 0 42%',
          background: 'linear-gradient(160deg, #0F1623 0%, #080C14 60%, #0A0F1E 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'none',
          flexDirection: 'column',
          padding: '40px 48px',
        }}
        className="lg:flex"
      >
        <MeshGrid />
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
            }}>
              <TruckIcon style={{ width: 24, height: 24, color: 'white' }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>TruckParts</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Market Platform</p>
            </div>
          </div>

          {/* Centre content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 40 }}>
            <div style={{ marginBottom: 28, animation: 'float 3s ease-in-out infinite' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'rgba(139,92,246,0.15)',
                border: '1px solid rgba(139,92,246,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <UserIcon style={{ width: 40, height: 40, color: '#8B5CF6' }} />
              </div>
            </div>

            <h1 style={{
              fontFamily: "'Outfit', sans-serif", fontSize: '2.2rem', fontWeight: 900,
              color: 'white', lineHeight: 1.15, marginBottom: 16,
            }}>
              Join India's Largest
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Truck Ecosystem</span>
            </h1>

            <p style={{
              fontFamily: "'Inter', sans-serif", fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32, maxWidth: 340,
            }}>
              Get access to 10,000+ verified parts, logistics network, live auctions, and a community of 50,000+ professionals.
            </p>

            {/* Steps */}
            {[
              { step: 1, text: 'Create your free account' },
              { step: 2, text: 'Browse 10,000+ truck parts' },
              { step: 3, text: 'Connect with the ecosystem' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14,
                animation: `fadeSlideIn 0.5s ease-out ${i * 100 + 100}ms both`,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Outfit', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: 'white',
                }}>
                  {s.step}
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>

          {/* Already have account */}
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>
              Sign in instead
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Register Form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', position: 'relative', overflowY: 'auto',
      }}>
        <div style={{
          width: '100%', maxWidth: 440, position: 'relative', zIndex: 2,
          animation: 'fadeSlideUp 0.5s ease-out both',
        }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #F97316, #FBBF24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TruckIcon style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              TruckParts Market
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 28px',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                Create your account
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Join 50,000+ professionals on TruckParts Market
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Name */}
              <FormField label="Full Name" id="reg-name" icon={UserIcon}>
                <input
                  id="reg-name" name="name" type="text"
                  value={formData.name} onChange={handleChange}
                  className="input-dark" placeholder="Rajesh Kumar" required
                  style={{ paddingLeft: 42 }}
                />
              </FormField>

              {/* Email */}
              <FormField label="Email Address" id="reg-email" icon={EnvelopeIcon}>
                <input
                  id="reg-email" name="email" type="email"
                  value={formData.email} onChange={handleChange}
                  className="input-dark" placeholder="rajesh@workshop.com" required
                  style={{ paddingLeft: 42 }}
                />
              </FormField>

              {/* Password */}
              <div>
                <label className="input-label" htmlFor="reg-password">Password</label>
                <div style={{ position: 'relative' }}>
                  <LockClosedIcon style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', width: 18, height: 18,
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    id="reg-password" name="password"
                    type={showPass ? 'text' : 'password'}
                    value={formData.password} onChange={handleChange}
                    className="input-dark" placeholder="Min 8 characters" required
                    style={{ paddingLeft: 42, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                    {showPass ? <EyeSlashIcon style={{ width: 18, height: 18 }} /> : <EyeIcon style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
                <PasswordStrength password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="input-label" htmlFor="reg-confirm">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <LockClosedIcon style={{
                    position: 'absolute', left: 14, top: '50%',
                    transform: 'translateY(-50%)', width: 18, height: 18,
                    color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <input
                    id="reg-confirm" name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirmPassword} onChange={handleChange}
                    className="input-dark" placeholder="Re-enter password" required
                    style={{
                      paddingLeft: 42, paddingRight: 44,
                      borderColor: formData.confirmPassword && formData.confirmPassword !== formData.password
                        ? 'var(--rose)' : '',
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0, display: 'flex' }}>
                    {showConfirm ? <EyeSlashIcon style={{ width: 18, height: 18 }} /> : <EyeIcon style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
                {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', color: 'var(--rose)', marginTop: 4 }}>
                    Passwords don't match
                  </p>
                )}
              </div>

              {/* Phone */}
              <FormField label="Phone (Optional)" id="reg-phone" icon={PhoneIcon}>
                <input
                  id="reg-phone" name="phone" type="tel"
                  value={formData.phone} onChange={handleChange}
                  className="input-dark" placeholder="+91 98765 43210"
                  style={{ paddingLeft: 42 }}
                />
              </FormField>

              {/* Address */}
              <div>
                <label className="input-label" htmlFor="reg-address">Address (Optional)</label>
                <div style={{ position: 'relative' }}>
                  <MapPinIcon style={{
                    position: 'absolute', left: 14, top: 14,
                    width: 18, height: 18, color: 'var(--text-muted)', pointerEvents: 'none',
                  }} />
                  <textarea
                    id="reg-address" name="address"
                    value={formData.address} onChange={handleChange}
                    className="input-dark" placeholder="Workshop / business address"
                    rows={2}
                    style={{ paddingLeft: 42, resize: 'none' }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                id="register-submit-btn"
                style={{ width: '100%', padding: '13px 24px', fontSize: '0.95rem', justifyContent: 'center', marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <svg style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                    </svg>
                    Creating account…
                  </>
                ) : 'Create Free Account'}
              </button>
            </form>
          </div>

          {/* Sign in link */}
          <p style={{
            fontFamily: "'Inter', sans-serif", fontSize: '0.82rem',
            color: 'var(--text-muted)', textAlign: 'center', marginTop: 16,
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--orange)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
