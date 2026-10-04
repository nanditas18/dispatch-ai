import React, { useState } from 'react';
import { Send, Calendar, CheckCheck, Clock, ShieldCheck, Copy, Check, FileText } from 'lucide-react';

export default function ArtifactSignoffPanel({ artifact, onSignoff, isDispatched, onManualEdit }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(artifact?.fullDraft || '');

  React.useEffect(() => {
    setEditedText(artifact?.fullDraft || '');
    setIsEditing(false);
  }, [artifact]);

  if (!artifact) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIconWrap}>
          <FileText size={24} color="#64748B" />
        </div>
        <h4 style={styles.emptyTitle}>No Artifact Generated</h4>
        <p style={styles.emptyDesc}>
          Select an incoming message from the inbox to trigger autonomous analysis and generate a response preview artifact.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(isEditing ? editedText : artifact.fullDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApprove = () => {
    if (onSignoff) {
      onSignoff({
        ...artifact,
        fullDraft: editedText
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.statusDot(isDispatched)} />
          <div>
            <h3 style={styles.title}>Visual Action Artifact</h3>
            <span style={styles.artifactTypeBadge}>{artifact.artifactType}</span>
          </div>
        </div>

        <div style={styles.headerActions}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={styles.ghostBtn}
            title={isEditing ? 'Preview Mode' : 'Edit Response'}
          >
            {isEditing ? 'Preview' : 'Edit Draft'}
          </button>
          <button onClick={handleCopy} style={styles.ghostBtn} title="Copy draft">
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} color="#94A3B8" />}
          </button>
        </div>
      </div>

      <div style={styles.metaBox}>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>RECIPIENT</span>
          <span style={styles.metaVal}>{artifact.recipient}</span>
        </div>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>SUBJECT</span>
          <span style={styles.metaVal}>{artifact.subjectLine}</span>
        </div>
        {artifact.meta?.dealValueEstimate && artifact.meta.dealValueEstimate !== 'N/A' && (
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>EST. DEAL VALUE</span>
            <span style={styles.metaValueHighlight}>{artifact.meta.dealValueEstimate}</span>
          </div>
        )}
      </div>

      {artifact.schedulingLink && (
        <div style={styles.calendarBanner}>
          <div style={styles.calendarIcon}>
            <Calendar size={16} color="#38BDF8" />
          </div>
          <div style={styles.calendarContent}>
            <div style={styles.calendarTitle}>Autonomous Calendar Scheduling Link Embedded</div>
            <a
              href={artifact.schedulingLink}
              target="_blank"
              rel="noreferrer"
              style={styles.calendarLink}
            >
              Google Calendar 15-min Slot Sync
            </a>
          </div>
        </div>
      )}

      <div style={styles.draftSection}>
        <div style={styles.draftHeader}>
          <span style={styles.draftLabel}>RESPONSE DRAFT (HUMAN-IN-THE-LOOP VERIFICATION)</span>
          <span style={styles.wordCount}>
            {(isEditing ? editedText : artifact.fullDraft).split(/\s+/).filter(Boolean).length} words
          </span>
        </div>

        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            style={styles.draftTextarea}
            rows={12}
          />
        ) : (
          <div style={styles.draftPreview}>
            <pre style={styles.preformattedText}>{artifact.fullDraft}</pre>
          </div>
        )}
      </div>

      <div style={styles.signoffFooter}>
        <div style={styles.signoffNote}>
          <ShieldCheck size={14} color="#10B981" style={{ marginRight: 6 }} />
          <span>Automated governance checks passed. Human confirmation required prior to dispatch.</span>
        </div>

        <button
          onClick={handleApprove}
          disabled={isDispatched}
          style={{
            ...styles.approveBtn,
            backgroundColor: isDispatched ? '#1E293B' : '#F8FAFC',
            color: isDispatched ? '#94A3B8' : '#0B0F17',
            cursor: isDispatched ? 'default' : 'pointer'
          }}
        >
          {isDispatched ? (
            <>
              <CheckCheck size={16} style={{ marginRight: 6 }} />
              DISPATCHED & AUDITED
            </>
          ) : (
            <>
              <Send size={16} style={{ marginRight: 6 }} />
              APPROVE & SEND DISPATCH
            </>
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  },
  emptyContainer: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    textAlign: 'center'
  },
  emptyIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: '8px'
  },
  emptyDesc: {
    fontSize: '13px',
    color: '#94A3B8',
    lineHeight: 1.5,
    maxWidth: '320px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #1E293B'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statusDot: (isDispatched) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isDispatched ? '#10B981' : '#38BDF8'
  }),
  title: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#F8FAFC',
    margin: 0
  },
  artifactTypeBadge: {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: '#38BDF8',
    letterSpacing: '0.04em'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  ghostBtn: {
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    color: '#94A3B8',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  metaBox: {
    backgroundColor: '#0F172A',
    padding: '12px 20px',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px'
  },
  metaLabel: {
    width: '120px',
    color: '#64748B',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  metaVal: {
    color: '#F8FAFC',
    fontWeight: '500',
    fontFamily: 'monospace'
  },
  metaValueHighlight: {
    color: '#10B981',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  calendarBanner: {
    margin: '14px 20px 0',
    padding: '10px 14px',
    backgroundColor: '#0B132B',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  calendarIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    backgroundColor: '#111C2E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  calendarContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  calendarTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#F8FAFC'
  },
  calendarLink: {
    fontSize: '11px',
    color: '#38BDF8',
    textDecoration: 'none'
  },
  draftSection: {
    padding: '16px 20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto'
  },
  draftHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  draftLabel: {
    fontSize: '11px',
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: '0.04em'
  },
  wordCount: {
    fontSize: '11px',
    color: '#64748B',
    fontFamily: 'monospace'
  },
  draftPreview: {
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    padding: '14px',
    flex: 1,
    overflowY: 'auto'
  },
  preformattedText: {
    color: '#E2E8F0',
    fontSize: '13px',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'inherit'
  },
  draftTextarea: {
    backgroundColor: '#0B0F17',
    border: '1px solid #38BDF8',
    borderRadius: '6px',
    padding: '14px',
    color: '#F8FAFC',
    fontSize: '13px',
    lineHeight: 1.6,
    outline: 'none',
    width: '100%',
    flex: 1,
    resize: 'none'
  },
  signoffFooter: {
    padding: '16px 20px',
    backgroundColor: '#0F172A',
    borderTop: '1px solid #1E293B',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  signoffNote: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#94A3B8'
  },
  approveBtn: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.03em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  }
};
