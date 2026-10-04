import React from 'react';
import { Layers, Database, ShieldAlert, Cpu, CheckCircle2, CircleDashed } from 'lucide-react';

export default function AgentPipelineLogs({ logs, activeMessage, isProcessing }) {
  const steps = [
    {
      id: 1,
      name: 'Agent 1: Intent Classifier',
      desc: 'Taxonomy categorization & urgency matrix analysis',
      icon: Layers,
      color: '#38BDF8'
    },
    {
      id: 2,
      name: 'Agent 2: Knowledge Engine',
      desc: 'Retrieval augmented synthesis against rate card & policies',
      icon: Database,
      color: '#38BDF8'
    },
    {
      id: 3,
      name: 'Agent 3: Action & Artifact Builder',
      desc: 'Commercial memo drafting & calendar scheduling link dispatch',
      icon: Cpu,
      color: '#38BDF8'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.pulseDot(isProcessing)} />
          <h4 style={styles.headerTitle}>Autonomous Agentic Pipeline</h4>
        </div>
        <span style={styles.statusBadge(isProcessing)}>
          {isProcessing ? 'SYNCHRONIZING' : 'PIPELINE READY'}
        </span>
      </div>

      <div style={styles.pipelineCards}>
        {steps.map((step) => {
          const logData = logs[step.id];
          const isCurrentActive = isProcessing && logData?.status === 'running';
          const isDone = logData?.status === 'completed';
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              style={{
                ...styles.stepCard,
                borderColor: isCurrentActive ? '#38BDF8' : isDone ? '#2D3748' : '#1E293B',
                backgroundColor: isCurrentActive ? '#111C2E' : '#111827'
              }}
            >
              <div style={styles.stepTop}>
                <div style={styles.stepTitleGroup}>
                  <div style={styles.stepIconWrap}>
                    <Icon size={14} color={isDone || isCurrentActive ? '#38BDF8' : '#64748B'} />
                  </div>
                  <div>
                    <div style={styles.stepName}>{step.name}</div>
                    <div style={styles.stepDesc}>{step.desc}</div>
                  </div>
                </div>

                <div>
                  {isDone ? (
                    <span style={styles.badgeSuccess}>
                      <CheckCircle2 size={12} style={{ marginRight: 4 }} /> DONE
                    </span>
                  ) : isCurrentActive ? (
                    <span style={styles.badgeRunning}>
                      <CircleDashed size={12} className="spin-icon" style={{ marginRight: 4 }} /> PROCESSING
                    </span>
                  ) : (
                    <span style={styles.badgePending}>QUEUED</span>
                  )}
                </div>
              </div>

              {logData?.message && (
                <div style={styles.logMessageRow}>
                  <span style={styles.logTimestamp}>STATUS</span>
                  <span style={styles.logMessageText}>{logData.message}</span>
                </div>
              )}

              {logData?.result && (
                <div style={styles.resultBox}>
                  {step.id === 1 && (
                    <div style={styles.summaryGrid}>
                      <div>
                        <span style={styles.fieldLabel}>Identified Category:</span>
                        <span style={styles.fieldValue}>{logData.result.category}</span>
                      </div>
                      <div>
                        <span style={styles.fieldLabel}>Urgency Score:</span>
                        <span style={styles.fieldUrgency(logData.result.urgencyScore)}>
                          Tier {logData.result.urgencyScore} / 5
                        </span>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={styles.fieldLabel}>Detected Intent:</span>
                        <span style={styles.fieldValueText}>{logData.result.summary}</span>
                      </div>
                    </div>
                  )}

                  {step.id === 2 && (
                    <div>
                      <div style={styles.fieldLabel}>Extracted Knowledge Sources:</div>
                      <div style={styles.docList}>
                        {logData.result.contextDocuments?.map((doc, idx) => (
                          <div key={idx} style={styles.docItem}>
                            <span style={styles.docSource}>{doc.source}:</span>
                            <span style={styles.docPreview}>
                              {Array.isArray(doc.items) ? doc.items.join(' | ') : doc.items}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.id === 3 && (
                    <div style={styles.summaryGrid}>
                      <div>
                        <span style={styles.fieldLabel}>Artifact Type:</span>
                        <span style={styles.fieldValue}>{logData.result.artifactType}</span>
                      </div>
                      <div>
                        <span style={styles.fieldLabel}>Signoff Target:</span>
                        <span style={styles.fieldValue}>{logData.result.suggestedAction}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '14px',
    paddingBottom: '10px',
    borderBottom: '1px solid #1E293B'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  pulseDot: (active) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: active ? '#38BDF8' : '#10B981',
    boxShadow: active ? '0 0 8px rgba(56, 189, 248, 0.4)' : 'none'
  }),
  headerTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0
  },
  statusBadge: (isProcessing) => ({
    fontSize: '11px',
    fontFamily: 'monospace',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: isProcessing ? 'rgba(56, 189, 248, 0.15)' : '#1E293B',
    color: isProcessing ? '#38BDF8' : '#94A3B8',
    border: '1px solid #1E293B'
  }),
  pipelineCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  stepCard: {
    borderRadius: '6px',
    border: '1px solid #1E293B',
    padding: '12px 14px',
    transition: 'all 0.2s ease'
  },
  stepTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  stepTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  stepIconWrap: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#F8FAFC'
  },
  stepDesc: {
    fontSize: '11px',
    color: '#64748B'
  },
  badgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  badgeRunning: {
    display: 'inline-flex',
    alignItems: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  badgePending: {
    fontSize: '11px',
    fontWeight: '500',
    color: '#64748B',
    backgroundColor: '#0B0F17',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid #1E293B'
  },
  logMessageRow: {
    marginTop: '8px',
    fontSize: '12px',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  logTimestamp: {
    fontSize: '10px',
    fontFamily: 'monospace',
    color: '#64748B',
    backgroundColor: '#0B0F17',
    padding: '1px 4px',
    borderRadius: '3px'
  },
  logMessageText: {
    color: '#94A3B8'
  },
  resultBox: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#0B0F17',
    borderRadius: '4px',
    border: '1px solid #1E293B',
    fontSize: '12px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  fieldLabel: {
    display: 'block',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#64748B',
    marginBottom: '2px'
  },
  fieldValue: {
    color: '#F8FAFC',
    fontWeight: '500'
  },
  fieldValueText: {
    color: '#CBD5E1',
    lineHeight: 1.4
  },
  fieldUrgency: (score) => ({
    color: score >= 4 ? '#F59E0B' : '#38BDF8',
    fontWeight: '600'
  }),
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '4px'
  },
  docItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    backgroundColor: '#111827',
    padding: '6px 8px',
    borderRadius: '4px',
    border: '1px solid #1E293B'
  },
  docSource: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#38BDF8'
  },
  docPreview: {
    fontSize: '11px',
    color: '#94A3B8'
  }
};
