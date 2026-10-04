import React, { useState } from 'react';
import { Key, Shield, ExternalLink, X, Check } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [inputVal, setInputVal] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(inputVal.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.headerTitleRow}>
            <div style={styles.iconWrapper}>
              <Key size={18} color="#38BDF8" />
            </div>
            <div>
              <h3 style={styles.title}>Gemini API Configuration</h3>
              <p style={styles.subtitle}>Autonomous multi-agent synthesis & inference key</p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close modal">
            <X size={18} color="#94A3B8" />
          </button>
        </div>

        <form onSubmit={handleSave} style={styles.body}>
          <div style={styles.infoBanner}>
            <Shield size={16} color="#94A3B8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={styles.infoText}>
              Your Gemini API Key is stored locally in your browser session for direct client calls to Google Gemini Flash. If no key is provided, DispatchAI automatically operates using our local deterministic reasoning engine.
            </p>
          </div>

          <label style={styles.label} htmlFor="gemini-key-input">
            Google Gemini API Key
          </label>
          <div style={styles.inputContainer}>
            <input
              id="gemini-key-input"
              type="password"
              placeholder="AIzaSy..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={styles.input}
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <div style={styles.helpRow}>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              style={styles.helpLink}
            >
              Get a Gemini API Key from Google AI Studio
              <ExternalLink size={12} style={{ marginLeft: 4 }} />
            </a>
          </div>

          <div style={styles.actionRow}>
            <button
              type="button"
              onClick={() => {
                setInputVal('');
                onSaveKey('');
                onClose();
              }}
              style={styles.clearBtn}
            >
              Clear & Use Local Engine
            </button>
            <button type="submit" style={styles.saveBtn}>
              {savedSuccess ? (
                <>
                  <Check size={16} style={{ marginRight: 6 }} /> Saved
                </>
              ) : (
                'Save Key'
              )}
            </button>
          </div>
        </form>
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
    maxWidth: '520px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    borderBottom: '1px solid #1E293B'
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconWrapper: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#F8FAFC',
    margin: 0
  },
  subtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    margin: 0
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    marginBottom: '20px'
  },
  infoText: {
    fontSize: '12px',
    color: '#94A3B8',
    lineHeight: 1.5,
    margin: 0
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#F8FAFC',
    marginBottom: '8px'
  },
  inputContainer: {
    marginBottom: '10px'
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.15s ease'
  },
  helpRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '24px'
  },
  helpLink: {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#38BDF8',
    fontSize: '12px',
    textDecoration: 'none'
  },
  actionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clearBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1E293B',
    color: '#94A3B8',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  saveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    color: '#0B0F17',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};
