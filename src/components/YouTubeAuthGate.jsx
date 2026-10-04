import React from 'react';
import { Video, Shield, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export default function YouTubeAuthGate({
  onAuthenticate,
  isConnecting,
  authError
}) {
  return (
    <div style={styles.gateContainer}>
      <div style={styles.gridOverlay} />

      <div style={styles.card}>
        <div style={styles.topLogo}>
          <div style={styles.logoIcon}>
            <Video size={22} color="#38BDF8" />
          </div>
          <span style={styles.appName}>DispatchAI</span>
          <span style={styles.hubBadge}>Creator Hub</span>
        </div>

        <div style={styles.header}>
          <h1 style={styles.title}>YouTube Creator Dispatch Hub</h1>
          <p style={styles.subtitle}>
            Autonomous multi-agent intelligence powered by <strong>Gemini 2.5 Flash</strong>. Sign in with your YouTube creator channel to ingest live comments, categorize inquiries, and draft verified response artifacts.
          </p>
        </div>

        {authError && (
          <div style={styles.errorBox}>
            <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={styles.errorText}>{authError}</p>
          </div>
        )}

        <div style={styles.actionBlock}>
          <button
            type="button"
            onClick={onAuthenticate}
            disabled={isConnecting}
            style={styles.signInButton}
          >
            {isConnecting ? (
              <>
                <RefreshCw size={16} className="spin-icon" style={{ marginRight: 10 }} />
                Authenticating with Google...
              </>
            ) : (
              <>
                <Video size={18} color="#0B0F17" style={{ marginRight: 10 }} />
                Sign in with YouTube
                <ArrowRight size={16} color="#0B0F17" style={{ marginLeft: 8 }} />
              </>
            )}
          </button>
        </div>

        <div style={styles.securityFooter}>
          <div style={styles.securityBadge}>
            <Shield size={14} color="#10B981" style={{ marginRight: 6, flexShrink: 0 }} />
            <span>Standard Google OAuth 2.0. Channel credentials configured on backend.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  gateContainer: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0B0F17',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden'
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(#1E293B 1px, transparent 1px)`,
    backgroundSize: '32px 32px',
    opacity: 0.25,
    pointerEvents: 'none'
  },
  card: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '12px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    position: 'relative',
    zIndex: 10
  },
  topLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px'
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontSize: '16px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    color: '#F8FAFC'
  },
  hubBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    border: '1px solid #1E293B',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  header: {
    marginBottom: '28px'
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: '8px',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: 0
  },
  errorBox: {
    backgroundColor: '#1C150C',
    border: '1px solid #78350F',
    borderRadius: '6px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '18px'
  },
  errorText: {
    fontSize: '12px',
    color: '#F59E0B',
    lineHeight: 1.4,
    margin: 0
  },
  actionBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  signInButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#F8FAFC',
    color: '#0B0F17',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.15s ease'
  },
  securityFooter: {
    marginTop: '28px',
    paddingTop: '16px',
    borderTop: '1px solid #1E293B'
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#64748B',
    lineHeight: 1.4
  }
};
