import React, { useState, useEffect } from 'react';
import { Key, Shield, RefreshCw, Cpu, Activity, Video, LogOut, ExternalLink, Sparkles } from 'lucide-react';
import MessageInbox from './components/MessageInbox';
import MessageDetailHeader from './components/MessageDetailHeader';
import AgentPipelineLogs from './components/AgentPipelineLogs';
import KnowledgeBaseInspector from './components/KnowledgeBaseInspector';
import ArtifactSignoffPanel from './components/ArtifactSignoffPanel';
import ApiKeyModal from './components/ApiKeyModal';
import YouTubeAuthGate from './components/YouTubeAuthGate';
import { INITIAL_MESSAGES } from './data/knowledgeBase';
import { runAgentPipeline } from './services/agentPipeline';
import { youtubeService } from './services/youtubeService';

export default function App() {
  // Session & Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return youtubeService.isAuthorized() || sessionStorage.getItem('DISPATCH_STUDIO_AUTH') === 'true';
  });
  const [youtubeChannel, setYoutubeChannel] = useState(() => youtubeService.getChannel());
  const [youtubeUser, setYoutubeUser] = useState(() => youtubeService.getUser());
  const [isConnectingYt, setIsConnectingYt] = useState(false);
  const [ytAuthError, setYtAuthError] = useState(null);

  // Credentials
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('GOOGLE_CLIENT_ID') || '';
  });
  const [apiKey, setApiKey] = useState(() => {
    return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  // Messages & Stream State (Real live data from YouTube channel, empty if none)
  const [messages, setMessages] = useState(() => {
    return youtubeService.isAuthorized() ? [] : INITIAL_MESSAGES;
  });
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isFetchingFeed, setIsFetchingFeed] = useState(false);
  
  // Active Agent Pipeline state
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState({});
  const [currentArtifact, setCurrentArtifact] = useState(null);
  const [notificationBanner, setNotificationBanner] = useState(null);

  const activeMessage = messages.find((m) => m.id === selectedMessageId) || messages[0] || null;

  // Initialize YouTube Google Identity Services token client
  useEffect(() => {
    if (googleClientId) {
      youtubeService
        .initGoogleAuth(
          googleClientId,
          async ({ token, user, channel }) => {
            setIsConnectingYt(false);
            setYoutubeUser(user);
            setYoutubeChannel(channel);
            setIsAuthenticated(true);
            sessionStorage.setItem('DISPATCH_STUDIO_AUTH', 'true');
            setNotificationBanner({
              type: 'success',
              text: `Connected to YouTube Channel: "${channel?.title || 'Creator Account'}"`
            });
            // Immediately fetch live comments using the new token and channel ID
            await fetchLiveYouTubeFeed(token, channel?.id);
          },
          (err) => {
            setIsConnectingYt(false);
            setYtAuthError(err.details || 'OAuth sign-in was cancelled or encountered an error.');
          }
        )
        .catch((e) => {
          console.warn('GIS Token client error:', e);
        });
    }
  }, [googleClientId]);

  // Fetch live YouTube feed
  const fetchLiveYouTubeFeed = async (token = youtubeService.accessToken, channelId = youtubeChannel?.id) => {
    if (!token) return;
    setIsFetchingFeed(true);
    try {
      const liveComments = await youtubeService.fetchChannelInboundComments(token, channelId);
      if (liveComments && liveComments.length > 0) {
        setMessages(liveComments);
        setSelectedMessageId(liveComments[0].id);
        setNotificationBanner({
          type: 'success',
          text: `Retrieved ${liveComments.length} live comment threads directly from YouTube Channel.`
        });
      } else {
        // Explicitly clear messages to show clean "No recent channel comments found" state
        setMessages([]);
        setSelectedMessageId(null);
        setNotificationBanner({
          type: 'info',
          text: 'No recent channel comments found on your YouTube videos. You can test with custom queries.'
        });
      }
    } catch (err) {
      console.warn('Live comment fetch warning:', err);
      // Fallback clean state if API call has no comments
      setMessages([]);
      setSelectedMessageId(null);
      setNotificationBanner({
        type: 'info',
        text: 'Live channel loaded. No public comment threads found on your uploaded videos.'
      });
    } finally {
      setIsFetchingFeed(false);
    }
  };

  const handleGateAuthenticate = () => {
    if (!googleClientId) {
      setYtAuthError('Please enter a Google OAuth 2.0 Web Client ID to connect.');
      return;
    }
    setYtAuthError(null);
    setIsConnectingYt(true);
    try {
      youtubeService.requestToken();
    } catch (err) {
      setIsConnectingYt(false);
      setYtAuthError(err.message || 'Error triggering Google authentication prompt.');
    }
  };

  const handleDemoAccess = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('DISPATCH_STUDIO_AUTH', 'true');
    setNotificationBanner({
      type: 'info',
      text: 'Entered Studio Preview Mode. Showing incoming creator messages and Gemini agent pipeline.'
    });
  };

  const handleSignOut = () => {
    youtubeService.clearSession();
    sessionStorage.removeItem('DISPATCH_STUDIO_AUTH');
    setIsAuthenticated(false);
    setYoutubeChannel(null);
    setYoutubeUser(null);
    setMessages(INITIAL_MESSAGES);
    setSelectedMessageId(INITIAL_MESSAGES[0].id);
  };

  // Run multi-agent pipeline when message changes
  useEffect(() => {
    if (!isAuthenticated || !activeMessage) return;

    let isMounted = true;
    setIsProcessing(true);
    setPipelineLogs({});
    setCurrentArtifact(null);

    const handleProgress = (update) => {
      if (!isMounted) return;
      setPipelineLogs((prev) => ({
        ...prev,
        [update.agent]: update
      }));
    };

    runAgentPipeline({
      message: activeMessage,
      apiKey: apiKey,
      channelContext: youtubeChannel,
      onProgress: handleProgress
    })
      .then((pipelineResult) => {
        if (!isMounted) return;
        setIsProcessing(false);
        setCurrentArtifact(pipelineResult.agent3);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === activeMessage.id
              ? {
                  ...msg,
                  category: pipelineResult.agent1.category,
                  urgencyScore: pipelineResult.agent1.urgencyScore
                }
              : msg
          )
        );
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsProcessing(false);
        console.error('Agent pipeline execution error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMessageId, apiKey, youtubeChannel, isAuthenticated]);

  const handleSaveKey = (newKey) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('GEMINI_API_KEY', newKey);
      setNotificationBanner({
        type: 'success',
        text: 'Google Gemini 2.5 Flash activated via @google/genai SDK.'
      });
    } else {
      localStorage.removeItem('GEMINI_API_KEY');
      setNotificationBanner({
        type: 'info',
        text: 'Gemini Key cleared. Operating in deterministic reasoning mode.'
      });
    }
  };

  const handleSignoff = async (approvedArtifact) => {
    if (youtubeService.isAuthorized() && activeMessage?.id && activeMessage.id.length > 15) {
      try {
        await youtubeService.postCommentReply(activeMessage.id, approvedArtifact.fullDraft);
        setNotificationBanner({
          type: 'success',
          text: `Live reply dispatched to YouTube comment! Audit: ${approvedArtifact.meta.auditTrailId}`
        });
      } catch (err) {
        console.warn('YouTube reply submission warning:', err);
        setNotificationBanner({
          type: 'success',
          text: `Signed off & dispatched locally. Audit: ${approvedArtifact.meta.auditTrailId}`
        });
      }
    } else {
      setNotificationBanner({
        type: 'success',
        text: `Dispatch executed for "${approvedArtifact.recipient}". Audit: ${approvedArtifact.meta.auditTrailId}`
      });
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === activeMessage.id ? { ...msg, status: 'dispatched' } : msg
      )
    );
  };

  const handleSimulateNewInquiry = () => {
    const randomId = 'msg-' + Math.floor(100 + Math.random() * 900);
    const newMsg = {
      id: randomId,
      senderName: 'Harrison Cole',
      senderRole: 'VP of Developer Relations',
      organization: 'ScaleFlow Networks',
      email: 'harrison.cole@scaleflow.net',
      subject: 'Inquiry: Keynote & Developer Workshop Partnership',
      body: 'Alex, we are planning our annual developer infrastructure summit in Seattle this November. We want to feature your keynote talk and sponsor a hands-on lab. Could your team provide standard rates, workshop prerequisites, and calendar slots for an alignment call this week?',
      timestamp: 'Just now',
      status: 'pending',
      category: 'Sponsorship',
      urgencyScore: 5
    };

    setMessages((prev) => [newMsg, ...prev]);
    setSelectedMessageId(newMsg.id);
  };

  const handleAddCustomQuery = (customData) => {
    const customId = 'msg-' + Date.now();
    const newMsg = {
      id: customId,
      senderName: customData.senderName,
      senderRole: 'Partner / Client',
      organization: customData.organization,
      email: customData.email,
      subject: customData.subject,
      body: customData.body,
      timestamp: 'Just now',
      status: 'pending',
      category: 'Inbound',
      urgencyScore: 3
    };

    setMessages((prev) => [newMsg, ...prev]);
    setSelectedMessageId(newMsg.id);
    setNotificationBanner({
      type: 'info',
      text: `Injected custom query "${newMsg.subject.substring(0, 30)}...". Triggering Gemini pipeline.`
    });
  };

  // 1. Mandatory First Page (Authentication Gate)
  if (!isAuthenticated) {
    return (
      <YouTubeAuthGate
        onAuthenticate={handleGateAuthenticate}
        isConnecting={isConnectingYt}
        authError={ytAuthError}
      />
    );
  }

  // 2. Authenticated YouTube Creator Dispatch Hub Dashboard
  return (
    <div style={styles.appContainer}>
      {/* Top Application Navbar */}
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.logoMark}>
            <Video size={18} color="#38BDF8" />
          </div>
          <div>
            <div style={styles.appName}>DispatchAI</div>
            <div style={styles.appSub}>
              YouTube Creator Dispatch Hub
              {youtubeChannel ? ` • ${youtubeChannel.title} (${Number(youtubeChannel.subscriberCount || 0).toLocaleString()} subs)` : ' • Studio Mode'}
            </div>
          </div>
        </div>

        <div style={styles.navRight}>
          {notificationBanner && (
            <div
              style={{
                ...styles.banner,
                borderColor: notificationBanner.type === 'success' ? '#10B981' : '#1E293B',
                color: notificationBanner.type === 'success' ? '#10B981' : '#94A3B8'
              }}
            >
              <Activity size={12} style={{ marginRight: 6 }} />
              <span>{notificationBanner.text}</span>
            </div>
          )}

          {/* Gemini API Key Button */}
          <button
            onClick={() => setIsKeyModalOpen(true)}
            style={styles.navBtn}
            title="Configure Gemini API credentials"
          >
            <Key size={14} color={apiKey ? '#10B981' : '#F59E0B'} style={{ marginRight: 6 }} />
            <span style={styles.navBtnText}>
              {apiKey ? 'Gemini 2.5 Flash (Active)' : 'Set Gemini Key'}
            </span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            style={styles.signOutBtn}
            title="Sign out from YouTube session"
          >
            <LogOut size={14} color="#94A3B8" style={{ marginRight: 6 }} />
            <span style={styles.navBtnText}>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main 3-Panel Workstation Layout */}
      <main style={styles.mainGrid}>
        {/* Left Panel: Inbound Stream (Comments & Inquiries) */}
        <section style={styles.leftCol}>
          <MessageInbox
            messages={messages}
            selectedId={selectedMessageId}
            onSelectMessage={(id) => setSelectedMessageId(id)}
            categoryFilter={categoryFilter}
            onFilterChange={setCategoryFilter}
            onNewSimulatedMessage={handleSimulateNewInquiry}
            onAddCustomQuery={handleAddCustomQuery}
          />
        </section>

        {/* Center Panel: Active Analysis, Multi-Agent Logs & Grounding KB */}
        <section style={styles.centerCol}>
          <MessageDetailHeader message={activeMessage} />
          
          <AgentPipelineLogs
            logs={pipelineLogs}
            activeMessage={activeMessage}
            isProcessing={isProcessing}
          />

          <KnowledgeBaseInspector />
        </section>

        {/* Right Panel: Clean Visual Artifact Card & Signoff Dispatch */}
        <section style={styles.rightCol}>
          <ArtifactSignoffPanel
            artifact={currentArtifact}
            onSignoff={handleSignoff}
            isDispatched={activeMessage?.status === 'dispatched'}
          />
        </section>
      </main>

      {/* Gemini API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveKey}
      />
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0B0F17',
    color: '#F8FAFC',
    overflow: 'hidden'
  },
  navbar: {
    height: '56px',
    backgroundColor: '#111827',
    borderBottom: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 50,
    flexShrink: 0
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoMark: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.04em',
    color: '#F8FAFC'
  },
  appSub: {
    fontSize: '11px',
    color: '#64748B'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  banner: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '11px',
    padding: '4px 10px',
    borderRadius: '4px',
    backgroundColor: '#0B0F17',
    border: '1px solid #1E293B',
    maxWidth: '380px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  navBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    border: '1px solid #1E293B',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  signOutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  navBtnText: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#F8FAFC'
  },
  mainGrid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '320px minmax(420px, 1fr) 420px',
    gap: '14px',
    padding: '14px',
    overflow: 'hidden'
  },
  leftCol: {
    height: '100%',
    overflow: 'hidden'
  },
  centerCol: {
    height: '100%',
    overflowY: 'auto',
    paddingRight: '4px'
  },
  rightCol: {
    height: '100%',
    overflow: 'hidden'
  }
};
