import React, { useState } from 'react';
import { Mail, Clock, Building, User, Tag, Sparkles, Plus, Send } from 'lucide-react';

export default function MessageInbox({
  messages,
  selectedId,
  onSelectMessage,
  categoryFilter,
  onFilterChange,
  onNewSimulatedMessage,
  onAddCustomQuery
}) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSender, setCustomSender] = useState('');
  const [customOrg, setCustomOrg] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');

  const categories = ['All', 'Sponsorship', 'Support', 'Fan Mail'];

  const filteredMessages = messages.filter((msg) => {
    if (categoryFilter === 'All') return true;
    return msg.category === categoryFilter;
  });

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customSubject.trim() || !customBody.trim()) return;

    onAddCustomQuery({
      senderName: customSender.trim() || 'Custom Inquirer',
      organization: customOrg.trim() || 'Independent Partner',
      email: customEmail.trim() || 'partner@example.com',
      subject: customSubject.trim(),
      body: customBody.trim()
    });

    // Reset & close
    setCustomSender('');
    setCustomOrg('');
    setCustomEmail('');
    setCustomSubject('');
    setCustomBody('');
    setShowCustomModal(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.titleWrap}>
            <Mail size={16} color="#38BDF8" />
            <h3 style={styles.title}>Inbound Stream</h3>
          </div>
          <span style={styles.countBadge}>{filteredMessages.length} Messages</span>
        </div>

        {/* Filter tags without emojis, clean SVG tags */}
        <div style={styles.filterRow}>
          {categories.map((cat) => {
            const isActive = categoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => onFilterChange(cat)}
                style={{
                  ...styles.filterBtn,
                  backgroundColor: isActive ? '#1E293B' : 'transparent',
                  color: isActive ? '#F8FAFC' : '#94A3B8',
                  borderColor: isActive ? '#38BDF8' : '#1E293B'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      <div style={styles.list}>
        {filteredMessages.length === 0 ? (
          <div style={styles.emptyInboxState}>
            <Mail size={28} color="#64748B" style={{ marginBottom: 10 }} />
            <h4 style={styles.emptyInboxTitle}>No recent channel comments found</h4>
            <p style={styles.emptyInboxSubtitle}>
              New comments and inquiries on your YouTube videos will appear here automatically. You can also inject a custom test query or refresh.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = msg.id === selectedId;
            const isUrgent = msg.urgencyScore >= 4;

            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg.id)}
                style={{
                  ...styles.item,
                  backgroundColor: isSelected ? '#151D2C' : '#111827',
                  borderColor: isSelected ? '#38BDF8' : '#1E293B'
                }}
              >
                <div style={styles.itemTop}>
                  <div style={styles.sender}>
                    <User size={13} color="#94A3B8" style={{ marginRight: 6 }} />
                    <span style={styles.senderName}>{msg.senderName}</span>
                  </div>
                  <div style={styles.timeTag}>
                    <Clock size={11} color="#64748B" style={{ marginRight: 4 }} />
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                {msg.organization && (
                  <div style={styles.orgRow}>
                    <Building size={12} color="#64748B" style={{ marginRight: 6 }} />
                    <span style={styles.orgText}>{msg.organization}</span>
                  </div>
                )}

                <div style={styles.subjectText}>{msg.subject}</div>
                <div style={styles.bodyPreview}>{msg.body}</div>

                <div style={styles.itemFooter}>
                  <span
                    style={{
                      ...styles.categoryTag,
                      color: msg.category === 'Sponsorship' ? '#38BDF8' : msg.category === 'Support' ? '#F59E0B' : '#10B981',
                      backgroundColor: msg.category === 'Sponsorship' ? 'rgba(56, 189, 248, 0.1)' : msg.category === 'Support' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    <Tag size={10} style={{ marginRight: 4 }} />
                    {msg.category}
                  </span>

                  {isUrgent && (
                    <span style={styles.urgentBadge}>
                      PRIORITY {msg.urgencyScore}/5
                    </span>
                  )}

                  {msg.status === 'dispatched' && (
                    <span style={styles.dispatchedBadge}>DISPATCHED</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.actionButtonGroup}>
          <button onClick={() => setShowCustomModal(true)} style={styles.customBtn}>
            <Plus size={14} style={{ marginRight: 6 }} />
            Custom Test Query
          </button>
          <button onClick={onNewSimulatedMessage} style={styles.simulateBtn}>
            <Sparkles size={14} style={{ marginRight: 6 }} />
            Random Inbound
          </button>
        </div>
      </div>

      {/* Modal to input custom test query */}
      {showCustomModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h4 style={styles.modalTitle}>Inbound Test Query Simulator</h4>
              <button onClick={() => setShowCustomModal(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleCustomSubmit} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div style={styles.formCol}>
                  <label style={styles.inputLabel}>Sender Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Jordan Mitchell"
                    value={customSender}
                    onChange={(e) => setCustomSender(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
                <div style={styles.formCol}>
                  <label style={styles.inputLabel}>Organization / Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Hardware Labs"
                    value={customOrg}
                    onChange={(e) => setCustomOrg(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formCol, flex: 1 }}>
                  <label style={styles.inputLabel}>Sender Email</label>
                  <input
                    type="email"
                    placeholder="jordan@apexlabs.dev"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formCol, flex: 1 }}>
                  <label style={styles.inputLabel}>Inquiry Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q1 Keynote & Sponsored Benchmark Deep Dive"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ ...styles.formCol, flex: 1 }}>
                  <label style={styles.inputLabel}>Inquiry Body / Message Content *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type any message (e.g. asking for rate card, keynote terms, or discord support)..."
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    style={styles.textareaField}
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  <Send size={14} style={{ marginRight: 6 }} />
                  Inject & Trigger Agents
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
  header: {
    padding: '16px',
    borderBottom: '1px solid #1E293B'
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#F8FAFC',
    margin: 0
  },
  countBadge: {
    fontSize: '11px',
    color: '#94A3B8',
    backgroundColor: '#0F172A',
    padding: '2px 8px',
    borderRadius: '10px',
    border: '1px solid #1E293B',
    fontFamily: 'monospace'
  },
  filterRow: {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto'
  },
  filterBtn: {
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid #1E293B',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease'
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  item: {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid #1E293B',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  itemTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px'
  },
  sender: {
    display: 'flex',
    alignItems: 'center'
  },
  senderName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#F8FAFC'
  },
  timeTag: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#64748B'
  },
  orgRow: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    color: '#94A3B8',
    marginBottom: '6px'
  },
  orgText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  subjectText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#E2E8F0',
    marginBottom: '4px'
  },
  bodyPreview: {
    fontSize: '11px',
    color: '#94A3B8',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: 1.4,
    marginBottom: '8px'
  },
  itemFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  categoryTag: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '3px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  urgentBadge: {
    fontSize: '9px',
    fontWeight: '700',
    color: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    padding: '2px 5px',
    borderRadius: '3px',
    fontFamily: 'monospace'
  },
  dispatchedBadge: {
    fontSize: '9px',
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: '2px 5px',
    borderRadius: '3px',
    marginLeft: 'auto'
  },
  footer: {
    padding: '12px 14px',
    borderTop: '1px solid #1E293B',
    backgroundColor: '#0F172A'
  },
  actionButtonGroup: {
    display: 'flex',
    gap: '8px'
  },
  customBtn: {
    flex: 1,
    padding: '8px 10px',
    backgroundColor: '#1E293B',
    color: '#F8FAFC',
    border: '1px solid #334155',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease'
  },
  simulateBtn: {
    flex: 1,
    padding: '8px 10px',
    backgroundColor: '#0F172A',
    color: '#94A3B8',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 8, 13, 0.85)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modalContent: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '520px',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 20px',
    borderBottom: '1px solid #1E293B'
  },
  modalTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#F8FAFC',
    margin: 0
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '14px',
    cursor: 'pointer'
  },
  modalForm: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formRow: {
    display: 'flex',
    gap: '12px'
  },
  formCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  inputLabel: {
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: '500'
  },
  inputField: {
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    padding: '8px 10px',
    color: '#F8FAFC',
    fontSize: '12px',
    outline: 'none'
  },
  textareaField: {
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    padding: '8px 10px',
    color: '#F8FAFC',
    fontSize: '12px',
    outline: 'none',
    resize: 'vertical'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '6px'
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #1E293B',
    color: '#94A3B8',
    padding: '7px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    cursor: 'pointer'
  },
  submitBtn: {
    backgroundColor: '#F8FAFC',
    border: 'none',
    color: '#0B0F17',
    padding: '7px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
  },
  emptyInboxState: {
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  emptyInboxTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: '6px'
  },
  emptyInboxSubtitle: {
    fontSize: '12px',
    color: '#94A3B8',
    lineHeight: 1.5,
    maxWidth: '260px',
    margin: 0
  }
};
