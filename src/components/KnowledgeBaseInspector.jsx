import React, { useState } from 'react';
import { BookOpen, DollarSign, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';

export default function KnowledgeBaseInspector() {
  const [activeTab, setActiveTab] = useState('rateCard');

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <BookOpen size={14} color="#38BDF8" />
          <h4 style={styles.headerTitle}>Grounding Knowledge Base</h4>
        </div>
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('rateCard')}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === 'rateCard' ? '#1E293B' : 'transparent',
              color: activeTab === 'rateCard' ? '#F8FAFC' : '#94A3B8'
            }}
          >
            Rate Card & Media Kit
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            style={{
              ...styles.tabBtn,
              backgroundColor: activeTab === 'policies' ? '#1E293B' : 'transparent',
              color: activeTab === 'policies' ? '#F8FAFC' : '#94A3B8'
            }}
          >
            Policies & FAQs
          </button>
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'rateCard' ? (
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Dedicated Video Deep Dive</span>
                <span style={styles.price}>{KNOWLEDGE_BASE.rateCard.dedicatedVideo.price}</span>
              </div>
              <p style={styles.cardDetail}>{KNOWLEDGE_BASE.rateCard.dedicatedVideo.deliverable}</p>
              <div style={styles.timeline}>Turnaround: {KNOWLEDGE_BASE.rateCard.dedicatedVideo.timeline}</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Integrated Mid-Roll (60-90s)</span>
                <span style={styles.price}>{KNOWLEDGE_BASE.rateCard.integratedSponsorship.price}</span>
              </div>
              <p style={styles.cardDetail}>{KNOWLEDGE_BASE.rateCard.integratedSponsorship.deliverable}</p>
              <div style={styles.timeline}>Turnaround: {KNOWLEDGE_BASE.rateCard.integratedSponsorship.timeline}</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Sunday TechPulse Newsletter</span>
                <span style={styles.price}>{KNOWLEDGE_BASE.rateCard.newsletterFeature.price}</span>
              </div>
              <p style={styles.cardDetail}>{KNOWLEDGE_BASE.rateCard.newsletterFeature.deliverable}</p>
              <div style={styles.timeline}>Schedule: {KNOWLEDGE_BASE.rateCard.newsletterFeature.timeline}</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>Keynote / Panel Speaking</span>
                <span style={styles.price}>{KNOWLEDGE_BASE.rateCard.keynoteOrPanel.price}</span>
              </div>
              <p style={styles.cardDetail}>{KNOWLEDGE_BASE.rateCard.keynoteOrPanel.deliverable}</p>
              <div style={styles.timeline}>Schedule: {KNOWLEDGE_BASE.rateCard.keynoteOrPanel.timeline}</div>
            </div>
          </div>
        ) : (
          <div style={styles.faqList}>
            <div style={styles.faqItem}>
              <div style={styles.faqQ}>Sponsorship Vetting Criteria</div>
              <div style={styles.faqA}>{KNOWLEDGE_BASE.sponsorshipPolicy.vettingCriteria}</div>
            </div>
            <div style={styles.faqItem}>
              <div style={styles.faqQ}>Payment & Settlement Terms</div>
              <div style={styles.faqA}>{KNOWLEDGE_BASE.sponsorshipPolicy.paymentTerms}</div>
            </div>
            <div style={styles.faqItem}>
              <div style={styles.faqQ}>VIP Discord Role Sync Resolution</div>
              <div style={styles.faqA}>{KNOWLEDGE_BASE.supportFaq.discordAccess}</div>
            </div>
            <div style={styles.faqItem}>
              <div style={styles.faqQ}>Code Repositories & Licensing</div>
              <div style={styles.faqA}>{KNOWLEDGE_BASE.supportFaq.codeRepositories}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    borderRadius: '8px',
    padding: '14px',
    marginBottom: '16px'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #1E293B'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  headerTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#F8FAFC',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0
  },
  tabs: {
    display: 'flex',
    gap: '4px'
  },
  tabBtn: {
    padding: '3px 8px',
    borderRadius: '4px',
    border: '1px solid #1E293B',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  content: {
    maxHeight: '170px',
    overflowY: 'auto'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  },
  card: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '6px',
    padding: '10px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px'
  },
  cardTitle: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#F8FAFC'
  },
  price: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#38BDF8',
    fontFamily: 'monospace'
  },
  cardDetail: {
    fontSize: '10px',
    color: '#94A3B8',
    lineHeight: 1.35,
    marginBottom: '4px'
  },
  timeline: {
    fontSize: '9px',
    color: '#64748B',
    fontFamily: 'monospace'
  },
  faqList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  faqItem: {
    backgroundColor: '#111827',
    border: '1px solid #1E293B',
    borderRadius: '4px',
    padding: '8px 10px'
  },
  faqQ: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: '2px'
  },
  faqA: {
    fontSize: '11px',
    color: '#94A3B8',
    lineHeight: 1.4
  }
};
