// Knowledge base data for DispatchAI / CommunityCopilot
export const KNOWLEDGE_BASE = {
  creatorProfile: {
    name: "Alex Vance",
    channel: "TechPulse & Future Systems",
    subscriberCount: "1.25M across YouTube, X & Substack",
    primaryTopics: ["AI Systems", "Software Architecture", "DevOps & Cloud", "Hardware Reviews"],
    audienceDemographics: "74% Software Developers / Tech Leads, Age 22-42, 62% US/EU/UK/Canada"
  },
  rateCard: {
    dedicatedVideo: {
      price: "$12,000 USD",
      deliverable: "1x Full 10-15 min dedicated deep-dive video with GitHub code companion + social posts",
      timeline: "3 weeks turnaround from script signoff"
    },
    integratedSponsorship: {
      price: "$4,500 USD",
      deliverable: "60-90s mid-roll dynamic sponsor integration + pinned comment + description link",
      timeline: "10 business days"
    },
    newsletterFeature: {
      price: "$1,800 USD",
      deliverable: "Dedicated section in Sunday 'TechPulse Weekly' (82k active subscribers, 44% open rate)",
      timeline: "Next available issue"
    },
    keynoteOrPanel: {
      price: "$8,000 USD + travel",
      deliverable: "45 min technical keynote or panel moderation on AI Systems Engineering",
      timeline: "Subject to calendar availability"
    }
  },
  sponsorshipPolicy: {
    vettingCriteria: "Must provide developer product trials or open source access. No gambling, crypto speculative tokens, or unverified VPNs.",
    paymentTerms: "50% upfront deposit upon contract execution, 50% net-15 post publish.",
    bookingCalendarUrl: "https://calendar.google.com/calendar/u/0/r/eventedit?text=DispatchAI+Partnership+Exploration&details=Discussion+regarding+creator+sponsorship+and+deliverables"
  },
  supportFaq: {
    discordAccess: "Supporters can link their Patreon or GitHub Sponsors account in Discord Settings -> Connections to claim VIP roles.",
    codeRepositories: "All video repos are licensed under MIT and hosted on https://github.com/alexvance-labs.",
    mentorshipInquiries: "1-on-1 mentorship is currently on waitlist. Next cohort opens next quarter via Substack announcement."
  },
  fanMailPolicy: {
    responseCommitment: "Personal replies sent during bi-weekly community mailbags.",
    guestPitching: "Submit guest pitches with a 1-page PDF synopsis or deck to press@dispatchai.internal"
  }
};

export const INITIAL_MESSAGES = [
  {
    id: "msg-101",
    senderName: "Marcus Sterling",
    senderRole: "Head of Developer Relations",
    organization: "VectorScale Labs",
    email: "marcus.s@vectorscalelabs.io",
    subject: "Q4 Developer Tooling Sponsorship & Deep Dive",
    body: "Hi Alex, we've been following your architectural deep dives on distributed vector databases. We'd love to sponsor a dedicated video and a 60-90s mid-roll integration in November for our new serverless indexing engine launch. Could you share your current rate card, calendar availability for a quick alignment sync next Tuesday, and deliverables schedule?",
    timestamp: "10 mins ago",
    status: "pending",
    category: "Sponsorship",
    urgencyScore: 5
  },
  {
    id: "msg-102",
    senderName: "Elena Rostova",
    senderRole: "Patreon Supporter & Community Member",
    organization: "Independent Engineer",
    email: "elena.rostova@devmail.org",
    subject: "Discord VIP Role Not Syncing after Renewal",
    body: "Hey Alex & Team, I renewed my Tier 2 Patreon subscription 3 days ago, but the bot hasn't updated my Discord role in the private architecture guild. My Discord handle is elena_codes#8192. Could someone check the webhook sync?",
    timestamp: "35 mins ago",
    status: "pending",
    category: "Support",
    urgencyScore: 3
  },
  {
    id: "msg-103",
    senderName: "David K.",
    senderRole: "CS Undergraduate Student",
    organization: "Stanford University",
    email: "dk_student@alumni.stanford.edu",
    subject: "Thank you for the Agentic Systems Masterclass",
    body: "Just wanted to send a note of gratitude! Your walkthrough on autonomous dispatch pipelines completely demystified multi-agent orchestration for my capstone team. We scored top of our cohort today. Keep making this incredible high-signal content!",
    timestamp: "2 hours ago",
    status: "pending",
    category: "Fan Mail",
    urgencyScore: 1
  },
  {
    id: "msg-104",
    senderName: "Sarah Chen",
    senderRole: "Global Marketing Director",
    organization: "CloudFlow Infrastructure",
    email: "s.chen@cloudflow.tech",
    subject: "Sponsorship: Keynote Speaker & Newsletter Feature",
    body: "Alex, we are hosting CloudFlow Summit in Chicago this coming December. We are looking for a keynote speaker on Production Multi-Agent Systems and would also love to book a dedicated feature in your Sunday TechPulse newsletter. Please send across your keynote requirements, pricing, and speaker terms.",
    timestamp: "3 hours ago",
    status: "pending",
    category: "Sponsorship",
    urgencyScore: 4
  }
];
