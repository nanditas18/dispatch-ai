/**
 * YouTube Data API v3 & OAuth 2.0 Client Service
 * Supports Google Identity Services (GIS) token client for YouTube Data API v3:
 * Scopes:
 * - https://www.googleapis.com/auth/youtube.readonly
 * - https://www.googleapis.com/auth/youtube.force-ssl
 */

const YOUTUBE_SCOPES = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl';

export class YouTubeService {
  constructor() {
    this.accessToken = localStorage.getItem('YOUTUBE_ACCESS_TOKEN') || null;
    this.tokenClient = null;
    this.userInfo = JSON.parse(localStorage.getItem('YOUTUBE_USER_PROFILE') || 'null');
    this.channelInfo = JSON.parse(localStorage.getItem('YOUTUBE_CHANNEL_PROFILE') || 'null');
  }

  isAuthorized() {
    return !!this.accessToken;
  }

  getChannel() {
    return this.channelInfo;
  }

  getUser() {
    return this.userInfo;
  }

  saveSession(token, user, channel) {
    this.accessToken = token;
    this.userInfo = user;
    this.channelInfo = channel;
    localStorage.setItem('YOUTUBE_ACCESS_TOKEN', token);
    if (user) localStorage.setItem('YOUTUBE_USER_PROFILE', JSON.stringify(user));
    if (channel) localStorage.setItem('YOUTUBE_CHANNEL_PROFILE', JSON.stringify(channel));
  }

  clearSession() {
    this.accessToken = null;
    this.userInfo = null;
    this.channelInfo = null;
    localStorage.removeItem('YOUTUBE_ACCESS_TOKEN');
    localStorage.removeItem('YOUTUBE_USER_PROFILE');
    localStorage.removeItem('YOUTUBE_CHANNEL_PROFILE');
  }

  /**
   * Initializes Google Identity Services Token Client
   */
  async initGoogleAuth(clientId, onTokenReceived, onError) {
    if (typeof window === 'undefined') return;

    // Load GIS script if not present
    if (!window.google?.accounts?.oauth2) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    if (!window.google?.accounts?.oauth2) {
      throw new Error('Google Identity Services SDK could not be loaded.');
    }

    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: YOUTUBE_SCOPES,
      callback: async (response) => {
        if (response.error) {
          if (onError) onError(response);
          return;
        }
        const token = response.access_token;
        try {
          const { user, channel } = await this.fetchChannelAndUserProfile(token);
          this.saveSession(token, user, channel);
          if (onTokenReceived) onTokenReceived({ token, user, channel });
        } catch (err) {
          console.error('Error fetching channel data with new token:', err);
          this.saveSession(token, null, null);
          if (onTokenReceived) onTokenReceived({ token, user: null, channel: null });
        }
      }
    });
  }

  requestToken() {
    if (!this.tokenClient) {
      throw new Error('Google Auth Token Client has not been initialized with Client ID.');
    }
    this.tokenClient.requestAccessToken({ prompt: 'consent' });
  }

  /**
   * Fetch creator channel & user profile details
   */
  async fetchChannelAndUserProfile(token = this.accessToken) {
    if (!token) throw new Error('No access token available');

    // 1. Fetch Google User info
    let user = null;
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (userRes.ok) {
        user = await userRes.json();
      }
    } catch (e) {
      console.warn('Could not fetch OAuth userinfo:', e);
    }

    // 2. Fetch YouTube Channel details
    const ytRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&mine=true',
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!ytRes.ok) {
      const err = await ytRes.text();
      throw new Error(`YouTube API Channel fetch error: ${err}`);
    }

    const data = await ytRes.json();
    const item = data.items?.[0];
    if (!item) {
      return { user, channel: null };
    }

    const channel = {
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      customUrl: item.snippet.customUrl,
      thumbnail: item.snippet.thumbnails?.default?.url || item.snippet.thumbnails?.medium?.url,
      subscriberCount: item.statistics.subscriberCount,
      videoCount: item.statistics.videoCount,
      viewCount: item.statistics.viewCount,
      uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads
    };

    return { user, channel };
  }

  /**
   * Fetch incoming channel comment threads from the creator's channel
   */
  async fetchChannelInboundComments(token = this.accessToken, channelId = this.channelInfo?.id) {
    if (!token) throw new Error('No YouTube access token available');

    // Build URL: If channelId is present, use allThreadsRelatedToChannelId. Otherwise use mine=true fallback.
    let url = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&maxResults=30&order=time';
    if (channelId) {
      url += `&allThreadsRelatedToChannelId=${encodeURIComponent(channelId)}`;
    } else {
      url += `&allThreadsRelatedToChannelId=`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.text();
      // If allThreadsRelatedToChannelId fails without channel ID, try fallback to recent uploaded video comments
      if (this.channelInfo?.uploadsPlaylistId) {
        return await this.fetchCommentsViaUploads(token, this.channelInfo.uploadsPlaylistId);
      }
      throw new Error(`YouTube API comments error: ${err}`);
    }

    const data = await res.json();
    if (!data.items || data.items.length === 0) return [];

    return this.transformCommentItems(data.items);
  }

  async fetchCommentsViaUploads(token, playlistId) {
    try {
      const playlistRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${encodeURIComponent(playlistId)}&maxResults=5`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!playlistRes.ok) return [];
      const plData = await playlistRes.json();
      const videoIds = plData.items?.map(it => it.contentDetails.videoId) || [];
      
      const allComments = [];
      for (const vid of videoIds) {
        const cRes = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${vid}&maxResults=10&order=time`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.items) allComments.push(...cData.items);
        }
      }
      return this.transformCommentItems(allComments);
    } catch (e) {
      console.warn("Fallback uploads comments error:", e);
      return [];
    }
  }

  transformCommentItems(items) {
    return items.map((thread) => {
      const topComment = thread.snippet.topLevelComment.snippet;
      return {
        id: thread.id,
        senderName: topComment.authorDisplayName,
        senderRole: 'YouTube Channel Viewer',
        organization: 'YouTube Community',
        email: topComment.authorChannelUrl || `${topComment.authorDisplayName.toLowerCase().replace(/\s+/g, '')}@youtube.com`,
        subject: `Comment on: ${topComment.videoId ? `Video ${topComment.videoId}` : 'Channel'}`,
        body: topComment.textDisplay || topComment.textOriginal,
        timestamp: formatRelativeTime(topComment.publishedAt),
        status: 'pending',
        category: 'Inbound',
        urgencyScore: 3,
        videoId: topComment.videoId,
        authorProfileImageUrl: topComment.authorProfileImageUrl,
        replyCount: thread.snippet.totalReplyCount
      };
    });
  }

  /**
   * Post a live comment reply to the YouTube thread
   */
  async postCommentReply(threadId, replyText, token = this.accessToken) {
    if (!token) throw new Error('No YouTube access token available');

    const body = {
      snippet: {
        parentId: threadId,
        textOriginal: replyText
      }
    };

    const res = await fetch('https://www.googleapis.com/youtube/v3/comments?part=snippet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to post YouTube reply: ${errText}`);
    }

    return await res.json();
  }
}

function formatRelativeTime(isoDate) {
  if (!isoDate) return 'Just now';
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const youtubeService = new YouTubeService();
