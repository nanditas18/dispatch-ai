import React from 'react';
import { User, Mail, Building, Clock, Tag, AlertCircle } from 'lucide-react';

export default function MessageDetailHeader({ message }) {
  if (!message) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyTitle}>No Active Message Selected</div>
        <div style={styles.emptyText}>
          Select a live YouTube comment or insert a test query from the left panel to begin multi-agent intent analysis and response synthesis.
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.topRow}>
        <div>
          <h2 style={styles.subject}>{message.subject}</h2>
          <div style={styles.senderMeta}>
            <div style={styles.metaItem}>
              <User size={13} color="#94A3B8" />
              <span style={styles.senderName}>{message.senderName}</span>
            </div>
            <div style={styles.metaItem}>
              <Mail size={13} color="#64748B" />
              <span style={styles.metaText}>{message.email}</span>
            </div>
            {message.organization && (
              <div style={styles.metaItem}>
                <Building size={13} color="#64748B" />
                <span style={styles.metaText}>{message.organization} ({message.senderRole})</span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.badgeColumn}>
          <span
            style={{
              ...styles.categoryTag,
              color: message.category === 'Sponsorship' ? '#38BDF8' : message.category === 'Support' ? '#F59E0B' : '#10B981',
              backgroundColor: message.category === 'Sponsorship' ? 'rgba(56, 189, 248, 0.1)' : message.category === 'Support' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
            }}
          >
            <Tag size={11} style={{ marginRight: 4 }} />
            {message.category}
          </span>
          <span style={styles.urgencyTag}>
            Urgency Score: {message.urgencyScore}/5
          </span>
        </div>
      </div>

      <div style={styles.bodyBox}>
        <div style={styles.bodyLabel}>INCOMING MESSAGE CONTENT</div>
        <p style={styles.bodyText}>{message.body}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '16px'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '14px'
  },
  subject: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: '6px'
  },
  senderMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px'
  },
  senderName: {
    color: '#F8FAFC',
    fontWeight: '500'
  },
  metaText: {
    color: '#94A3B8'
  },
  badgeColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px'
  },
  categoryTag: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  urgencyTag: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#94A3B8',
    backgroundColor: '#0F172A',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #1E293B',
    fontFamily: 'monospace'
  },
  bodyBox: {
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    padding: '12px 14px'
  },
  bodyLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: '0.04em',
    marginBottom: '6px'
  },
  bodyText: {
    fontSize: '13px',
    color: '#CBD5E1',
    lineHeight: 1.5,
    margin: 0
  },
  emptyContainer: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    padding: '24px 20px',
    marginBottom: '16px',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: '6px'
  },
  emptyText: {
    fontSize: '12px',
    color: '#94A3B8',
    lineHeight: 1.5,
    maxWidth: '480px',
    margin: '0 auto'
  }
};
