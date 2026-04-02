// Login page — Google OAuth via Supabase
// On success: redirect to /onboarding
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const C = {
  bg:      '#fdf8f5',
  card:    '#ffffff',
  border:  '#e5d4c5',
  text:    '#2d1f17',
  muted:   '#7a6555',
  accent:  '#c47a5c',
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/onboarding` },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Inter:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: ${C.bg};
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 24px;
        }

        .login-card {
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 20px;
          padding: 48px 40px 40px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(45,31,23,0.07);
        }

        .login-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 600;
          color: ${C.text};
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }

        .login-tagline {
          font-size: 0.875rem;
          color: ${C.muted};
          margin-bottom: 36px;
        }

        .login-divider {
          width: 40px;
          height: 2px;
          background: ${C.accent};
          border-radius: 2px;
          margin: 0 auto 36px;
        }

        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 20px;
          background: ${C.text};
          color: ${C.bg};
          border: none;
          border-radius: 12px;
          font-family: 'Inter', sans-serif;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        .login-btn:hover:not(:disabled) { opacity: 0.85; }
        .login-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-google-icon {
          flex-shrink: 0;
        }

        .login-error {
          margin-top: 14px;
          font-size: 0.8125rem;
          color: #c0392b;
        }

        .login-footer {
          margin-top: 24px;
          font-size: 0.8125rem;
          color: ${C.muted};
          line-height: 1.5;
        }
      `}</style>

      <div className="login-root">
        <div className="login-card">
          <div className="login-logo">trackmyskin</div>
          <div className="login-tagline">Your personalised skincare tracker</div>
          <div className="login-divider" />

          <button
            className="login-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="login-google-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {loading ? 'Redirecting…' : 'Sign in with Google'}
          </button>

          {error && <div className="login-error">{error}</div>}

          <p className="login-footer">
            New here? You'll set up your routine after signing in.
          </p>
        </div>
      </div>
    </>
  )
}
