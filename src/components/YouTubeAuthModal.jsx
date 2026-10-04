import React, { useState } from 'react';
import { Video, Shield, LogOut, CheckCircle, RefreshCw, AlertTriangle, Key } from 'lucide-react';

export default function YouTubeAuthModal({
  isOpen,
  onClose,
  channel,
  user,
  onConnect,
  onDisconnect,
  clientId,
  onSaveClientId,
  isConnecting,
  authError
}) {
  const [inputClientId, setInputClientId] = useState(clientId || '');

  if (!isOpen) return null;

  const handleSaveAndConnect = (e) => {
    e.preventDefault();
    if (inputClientId.trim()) {
      onSaveClientId(inputClientId.trim());
    }
    onConnect();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.ytIconWrap}>
              <Video size={20} color="#F8FAFC" />
            </div>
            <div>
              <h3 style={styles.title}>Google / YouTube Channel Authentication</h3>
              <p style={styles.subtitle}>OAuth 2.0 connection to stream live creator comments & inquiries</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {channel ? (
            <div style={styles.connectedCard}>
              <div style={styles.channelRow}>
                {channel.thumbnail ? (
                  <img src={channel.thumbnail} alt={channel.title} style={styles.channelThumb} />
                ) : (
                  <div style={styles.channelThumbFallback}>YT</div>
                )}
                <div>
                  <h4 style={styles.channelTitle}>{channel.title}</h4>
                  <div style={styles.channelStats}>
                    <span>{Number(channel.subscriberCount || 0).toLocaleString()} Subscribers</span>
                    <span>•</span>
                    <span>{channel.videoCount || 0} Videos</span>
                  </div>
                </div>
                <div style={styles.verifiedBadge}>
                  <CheckCircle size={14} color="#10B981" style={{ marginRight: 4 }} />
                  CONNECTED
                </div>
              </div>

              <div style={styles.authInfoRow}>
                <span style={styles.authInfoLabel}>Authorized Account:</span>
                <span style={styles.authInfoVal}>{user?.email || 'Authenticated YouTube Creator'}</span>
              </div>

              <div style={styles.disconnectRow}>
                <button onClick={onDisconnect} style={styles.disconnectBtn}>
                  <LogOut size={14} style={{ marginRight: 6 }} />
                  Disconnect YouTube Channel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={styles.infoBanner}>
                <Shield size={16} color="#38BDF8" style={{ marginTop: '2px', flexShrink: 0 }} />
                <p style={styles.bannerText}>
                  Connect your verified YouTube creator account via Google Identity Services OAuth 2.0. This allows DispatchAI to read live inbound comment threads and dispatch AI-drafted responses.
                </p>
              </div>

              {authError && (
                <div style={styles.errorBanner}>
                  <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <p style={styles.errorText}>{authError}</p>
                </div>
              )}

              <form onSubmit={handleSaveAndConnect}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>
                    Google OAuth 2.0 Web Client ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234567890-abc.apps.googleusercontent.com"
                    value={inputClientId}
                    onChange={(e) => setInputClientId(e.target.value)}
                    style={styles.input}
                    autoComplete="off"
                  />
                  <span style={styles.helperText}>
                    From Google Cloud Console: Enable "YouTube Data API v3" and create an OAuth 2.0 Web Client ID with authorized JavaScript origin: <code>http://localhost:5173</code>.
                  </span>
                </div>

                <div style={styles.actions}>
                  <button
                    type="submit"
                    disabled={isConnecting}
                    style={styles.connectBtn}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw size={14} className="spin-icon" style={{ marginRight: 6 }} />
                        Authenticating with Google...
                      </>
                    ) : (
                      <>
                        <Video size={16} color="#F8FAFC" style={{ marginRight: 8 }} />
                        Sign in with Google / YouTube
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 13, 0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modal: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '540px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid #1E293B'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  ytIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#F8FAFC',
    margin: 0
  },
  subtitle: {
    fontSize: '11px',
    color: '#94A3B8',
    margin: 0
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '16px',
    cursor: 'pointer'
  },
  body: {
    padding: '24px'
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#0F172A',
    borderRadius: '6px',
    border: '1px solid #1E293B',
    marginBottom: '18px'
  },
  bannerText: {
    fontSize: '12px',
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: 0
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '12px 14px',
    backgroundColor: '#1E1711',
    borderRadius: '6px',
    border: '1px solid #78350F',
    marginBottom: '18px'
  },
  errorText: {
    fontSize: '12px',
    color: '#F59E0B',
    lineHeight: 1.4,
    margin: 0
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '20px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#F8FAFC'
  },
  input: {
    padding: '10px 12px',
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    color: '#F8FAFC',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'monospace'
  },
  helperText: {
    fontSize: '11px',
    color: '#64748B',
    lineHeight: 1.4
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  connectBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#F8FAFC',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease'
  },
  connectedCard: {
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    padding: '18px'
  },
  channelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  channelThumb: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '1px solid #334155'
  },
  channelThumbFallback: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700'
  },
  channelTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#F8FAFC',
    margin: '0 0 4px 0'
  },
  channelStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#94A3B8'
  },
  verifiedBadge: {
    marginLeft: 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  authInfoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    padding: '10px 0',
    borderTop: '1px solid #1E293B',
    borderBottom: '1px solid #1E293B',
    marginBottom: '16px'
  },
  authInfoLabel: {
    color: '#64748B'
  },
  authInfoVal: {
    color: '#F8FAFC',
    fontFamily: 'monospace'
  },
  disconnectRow: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  disconnectBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1E293B',
    color: '#94A3B8',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  }
};
