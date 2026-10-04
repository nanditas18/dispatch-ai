import { GoogleGenAI } from '@google/genai';
import { KNOWLEDGE_BASE } from '../data/knowledgeBase';

/**
 * Service to execute the 3-agent autonomous pipeline:
 * Agent 1: Intent Classifier (Urgency, Category: Sponsorship / Support / Fan Mail / Video Feedback)
 * Agent 2: Knowledge Engine (RAG extraction against rate card, FAQs, creator profile, channel context)
 * Agent 3: Action & Artifact Builder (Response formatting, calendar booking links, dispatch metadata)
 * 
 * Powered by @google/genai SDK using model 'gemini-2.5-flash'.
 */

export async function runAgentPipeline({ message, apiKey, channelContext, onProgress }) {
  // Determine key: priority to passed key, then Vite env, then fallback
  const resolvedKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  // Initialize @google/genai SDK instance if key exists
  let ai = null;
  if (resolvedKey) {
    try {
      ai = new GoogleGenAI({ apiKey: resolvedKey });
    } catch (err) {
      console.warn("Could not initialize @google/genai SDK:", err);
    }
  }

  // Step 1: Agent 1 - Intent Classifier
  if (onProgress) onProgress({ agent: 1, name: 'Agent 1: Intent Classifier', status: 'running', message: 'Analyzing inquiry taxonomy, sentiment, and urgency matrix with Gemini 2.5 Flash...' });
  
  let agent1Result = null;
  if (ai) {
    try {
      agent1Result = await callGeminiAgent1(ai, message, channelContext);
    } catch (err) {
      console.warn("Gemini @google/genai API error on Agent 1, falling back to local reasoning:", err);
      agent1Result = runLocalAgent1(message, channelContext);
    }
  } else {
    await delay(600);
    agent1Result = runLocalAgent1(message, channelContext);
  }

  if (onProgress) onProgress({ agent: 1, name: 'Agent 1: Intent Classifier', status: 'completed', result: agent1Result });

  // Step 2: Agent 2 - Knowledge Engine
  if (onProgress) onProgress({ agent: 2, name: 'Agent 2: Knowledge Engine', status: 'running', message: `Querying grounding knowledge base & channel rate cards for category "${agent1Result.category}"...` });

  let agent2Result = null;
  if (ai) {
    try {
      agent2Result = await callGeminiAgent2(ai, message, agent1Result, channelContext);
    } catch (err) {
      console.warn("Gemini @google/genai API error on Agent 2, falling back to local knowledge retrieval:", err);
      agent2Result = runLocalAgent2(message, agent1Result, channelContext);
    }
  } else {
    await delay(700);
    agent2Result = runLocalAgent2(message, agent1Result, channelContext);
  }

  if (onProgress) onProgress({ agent: 2, name: 'Agent 2: Knowledge Engine', status: 'completed', result: agent2Result });

  // Step 3: Agent 3 - Action & Artifact Builder
  if (onProgress) onProgress({ agent: 3, name: 'Agent 3: Action & Artifact Builder', status: 'running', message: 'Generating tailored preview artifact, scheduling links, and signoff action dispatch...' });

  let agent3Result = null;
  if (ai) {
    try {
      agent3Result = await callGeminiAgent3(ai, message, agent1Result, agent2Result, channelContext);
    } catch (err) {
      console.warn("Gemini @google/genai API error on Agent 3, falling back to local artifact builder:", err);
      agent3Result = runLocalAgent3(message, agent1Result, agent2Result, channelContext);
    }
  } else {
    await delay(650);
    agent3Result = runLocalAgent3(message, agent1Result, agent2Result, channelContext);
  }

  if (onProgress) onProgress({ agent: 3, name: 'Agent 3: Action & Artifact Builder', status: 'completed', result: agent3Result });

  return {
    agent1: agent1Result,
    agent2: agent2Result,
    agent3: agent3Result,
    completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* @google/genai SDK Integration Calls (gemini-2.5-flash) */

async function callGeminiAgent1(ai, message, channelContext) {
  const channelDetails = channelContext 
    ? `Connected YouTube Channel: "${channelContext.title}" (${channelContext.subscriberCount || 'N/A'} subscribers)`
    : `Creator Channel: "${KNOWLEDGE_BASE.creatorProfile.channel}" (${KNOWLEDGE_BASE.creatorProfile.subscriberCount})`;

  const prompt = `You are Agent 1 (Intent Classifier) for a creator dispatch system.
${channelDetails}

Inbound message/comment:
From: ${message.senderName} (${message.organization || 'Viewer'})
Subject: ${message.subject}
Message Body:
"${message.body}"

Analyze the intent and return a valid JSON object strictly complying with this structure:
{
  "category": "Sponsorship" | "Support" | "Fan Mail" | "Video Feedback",
  "urgencyScore": 1 to 5,
  "summary": "Concise 1-sentence summary of the intent",
  "keyEntities": ["list", "of", "detected", "entities"],
  "recommendedAction": "Recommended next step"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  return parseJsonSafe(response.text, () => runLocalAgent1(message, channelContext));
}

async function callGeminiAgent2(ai, message, agent1, channelContext) {
  const prompt = `You are Agent 2 (Knowledge Engine) for the creator.
Knowledge Base:
${JSON.stringify(KNOWLEDGE_BASE, null, 2)}

Inbound context:
Sender: ${message.senderName}
Subject: ${message.subject}
Body: "${message.body}"
Agent 1 Intent:
${JSON.stringify(agent1)}

Retrieve the exact relevant details from the knowledge base (rate card pricing, Discord access, or policies) and draft a contextual creator response tailored directly to the inquiry.
Return a STRICT JSON object:
{
  "matchedCategory": "${agent1.category}",
  "contextDocuments": [
    { "source": "Source Name", "items": ["Key detail 1", "Key detail 2"] }
  ],
  "draftDraft": "Contextual tailored reply body"
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.25
    }
  });

  return parseJsonSafe(response.text, () => runLocalAgent2(message, agent1, channelContext));
}

async function callGeminiAgent3(ai, message, agent1, agent2, channelContext) {
  const isSponsorship = agent1.category === "Sponsorship";
  const calendarUrl = isSponsorship ? `${KNOWLEDGE_BASE.sponsorshipPolicy.bookingCalendarUrl}&add=${encodeURIComponent(message.email)}` : null;

  const prompt = `You are Agent 3 (Action & Artifact Builder).
Inbound from: ${message.senderName} <${message.email}>
Subject: ${message.subject}
Category: ${agent1.category}
Urgency: ${agent1.urgencyScore}
Draft text from Knowledge Engine:
${agent2.draftDraft}

Format the finalized response artifact. If category is Sponsorship, include calendar booking instructions.
Return STRICT JSON:
{
  "artifactType": "COMMERCIAL_DEAL_MEMO" | "SUPPORT_RESOLUTION_DISPATCH" | "COMMUNITY_NOTE" | "VIDEO_FEEDBACK_RESPONSE",
  "subjectLine": "Re: ${message.subject}",
  "recipient": "${message.email}",
  "schedulingLink": ${isSponsorship ? `"${calendarUrl}"` : 'null'},
  "suggestedAction": "${isSponsorship ? 'DISPATCH_PROPOSAL_WITH_CALENDAR' : 'DISPATCH_DIRECT_REPLY'}",
  "readyToSend": true,
  "fullDraft": "The complete polished response text ready for one-click approval",
  "meta": {
    "urgency": ${agent1.urgencyScore},
    "senderOrganization": "${message.organization || 'YouTube Community'}",
    "dealValueEstimate": "${isSponsorship ? '$4,500 - $12,000 USD' : 'N/A'}",
    "auditTrailId": "DSP-${Date.now().toString(36).toUpperCase()}"
  }
}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  return parseJsonSafe(response.text, () => runLocalAgent3(message, agent1, agent2, channelContext));
}

/* Local Deterministic Agent Implementations */

function runLocalAgent1(message, channelContext) {
  const text = ((message.subject || '') + " " + (message.body || '')).toLowerCase();
  let category = "Fan Mail";
  let urgency = 2;
  let summary = "";
  let keyEntities = [];

  const isSponsor = text.includes("sponsor") || text.includes("rate card") || text.includes("pricing") || text.includes("launch") || text.includes("keynote") || text.includes("partnership") || text.includes("rates") || text.includes("newsletter") || text.includes("video") || text.includes("mid-roll");
  const isSupport = text.includes("discord") || text.includes("role") || text.includes("patreon") || text.includes("issue") || text.includes("error") || text.includes("support") || text.includes("sync") || text.includes("bug") || text.includes("access") || text.includes("account");
  const isFeedback = text.includes("video") || text.includes("audio") || text.includes("timestamp") || text.includes("tutorial") || text.includes("sound") || text.includes("explain") || text.includes("part 2");

  if (isSponsor) {
    category = "Sponsorship";
    urgency = (text.includes("q4") || text.includes("summit") || text.includes("urgent") || text.includes("launch")) ? 5 : 4;
    const targets = [];
    if (text.includes("keynote") || text.includes("speaker")) targets.push("Keynote/Speaking");
    if (text.includes("newsletter")) targets.push("Newsletter Feature");
    if (text.includes("dedicated") || text.includes("deep dive")) targets.push("Dedicated Video");
    if (text.includes("mid-roll") || text.includes("integration")) targets.push("Mid-roll Sponsor");

    summary = `Commercial collaboration inquiry from ${message.organization || message.senderName}.`;
    keyEntities = ["Sponsorship", ...(targets.length > 0 ? targets : ["Rate Card Inquiry"]), message.organization || message.senderName];
  } else if (isSupport) {
    category = "Support";
    urgency = text.includes("broken") || text.includes("urgent") ? 4 : 3;
    summary = `Support inquiry regarding account access or synchronization.`;
    keyEntities = ["Support", "Membership Access", message.senderName];
  } else if (isFeedback) {
    category = "Video Feedback";
    urgency = 2;
    summary = `Viewer feedback and questions regarding channel video content.`;
    keyEntities = ["Video Feedback", "Production Inquiry", message.senderName];
  } else {
    category = "Fan Mail";
    urgency = 1;
    summary = `Community engagement and note of appreciation from ${message.senderName}.`;
    keyEntities = ["Community Note", message.senderName];
  }

  return {
    category,
    urgencyScore: urgency,
    summary,
    keyEntities,
    recommendedAction: category === "Sponsorship" ? "Dispatch targeted rate card schedule & offer calendar alignment" : category === "Support" ? "Provide immediate self-serve troubleshooting & bot sync policy" : "Send personal creator acknowledgment"
  };
}

function runLocalAgent2(message, agent1, channelContext) {
  const text = ((message.subject || '') + " " + (message.body || '')).toLowerCase();
  const contextExtracted = [];
  let draftedCore = "";

  const channelTitle = channelContext?.title || KNOWLEDGE_BASE.creatorProfile.channel;

  if (agent1.category === "Sponsorship") {
    const matchedRates = [];
    const wantsKeynote = text.includes("keynote") || text.includes("speaker") || text.includes("summit");
    const wantsNewsletter = text.includes("newsletter") || text.includes("weekly");
    const wantsDedicated = text.includes("dedicated") || text.includes("deep dive");
    const wantsMidroll = text.includes("mid-roll") || text.includes("integration") || text.includes("60-90s");

    if (wantsKeynote) {
      matchedRates.push(`Keynote / Panel Moderation: ${KNOWLEDGE_BASE.rateCard.keynoteOrPanel.price} (${KNOWLEDGE_BASE.rateCard.keynoteOrPanel.deliverable})`);
    }
    if (wantsNewsletter) {
      matchedRates.push(`TechPulse Weekly Newsletter: ${KNOWLEDGE_BASE.rateCard.newsletterFeature.price} (${KNOWLEDGE_BASE.rateCard.newsletterFeature.deliverable})`);
    }
    if (wantsDedicated) {
      matchedRates.push(`Dedicated Deep-Dive Video: ${KNOWLEDGE_BASE.rateCard.dedicatedVideo.price} (${KNOWLEDGE_BASE.rateCard.dedicatedVideo.deliverable})`);
    }
    if (wantsMidroll || (!wantsKeynote && !wantsNewsletter && !wantsDedicated)) {
      matchedRates.push(`Integrated Sponsor (60-90s): ${KNOWLEDGE_BASE.rateCard.integratedSponsorship.price} (${KNOWLEDGE_BASE.rateCard.integratedSponsorship.deliverable})`);
    }

    contextExtracted.push({
      source: "Relevant Rate Card Quotations",
      items: matchedRates
    });
    contextExtracted.push({
      source: "Sponsorship Vetting & Terms",
      items: [
        `Policy: ${KNOWLEDGE_BASE.sponsorshipPolicy.vettingCriteria}`,
        `Payment Terms: ${KNOWLEDGE_BASE.sponsorshipPolicy.paymentTerms}`
      ]
    });

    const rateItemsBullet = matchedRates.map(r => `• ${r}`).join('\n');
    draftedCore = `Thank you for reaching out regarding opportunities with ${channelTitle}.

Based on your inquiry, here are the tailored details for your review:
${rateItemsBullet}

All brand collaborations must adhere to our developer integrity policy: ${KNOWLEDGE_BASE.sponsorshipPolicy.vettingCriteria}. Payment terms are ${KNOWLEDGE_BASE.sponsorshipPolicy.paymentTerms}.

We would be glad to coordinate a brief 15-minute sync to finalize the schedule and review your technical briefing.`;
  } else if (agent1.category === "Support") {
    contextExtracted.push({
      source: "Community Support FAQ",
      items: [
        KNOWLEDGE_BASE.supportFaq.discordAccess,
        KNOWLEDGE_BASE.supportFaq.codeRepositories
      ]
    });

    draftedCore = `Thanks for reaching out and thank you for being a valued part of our creator community!

Here are the direct steps to resolve your role synchronization:
1. Open Discord Settings -> Connections.
2. Verify that your Patreon or GitHub Sponsors account is linked and the "Display on profile" toggle is enabled.
3. Our automated server sync daemon processes active memberships every 60 minutes. If your handle remains unassigned after the next cycle, our moderator bot triggers an automated override via your Discord ID (${message.body.includes('#') ? message.body.match(/[\w_]+#\d{4}/)?.[0] || 'account' : 'account'}).`;
  } else if (agent1.category === "Video Feedback") {
    contextExtracted.push({
      source: "Channel Production Guidelines",
      items: [
        KNOWLEDGE_BASE.supportFaq.codeRepositories,
        `Channel: ${channelTitle}`
      ]
    });

    draftedCore = `Thanks for the thoughtful feedback on our recent video upload! All companion source code and reference architectures are published on GitHub (https://github.com/alexvance-labs). We'll also cover this specific point in our upcoming technical walkthrough.`;
  } else {
    contextExtracted.push({
      source: "Community Guidelines & Impact Metrics",
      items: [
        KNOWLEDGE_BASE.fanMailPolicy.responseCommitment,
        `Audience Reach: ${KNOWLEDGE_BASE.creatorProfile.audienceDemographics}`
      ]
    });

    draftedCore = `Thank you so much for the kind words and encouragement!

Knowing that our systems architecture and engineering deep dives made a direct impact on your work is truly the best part of running ${channelTitle}. Wishing you continued success with all your engineering milestones!`;
  }

  return {
    matchedCategory: agent1.category,
    contextDocuments: contextExtracted,
    draftDraft: draftedCore
  };
}

function runLocalAgent3(message, agent1, agent2, channelContext) {
  const isSponsorship = agent1.category === "Sponsorship";
  const calendarUrl = isSponsorship ? `${KNOWLEDGE_BASE.sponsorshipPolicy.bookingCalendarUrl}&add=${encodeURIComponent(message.email)}` : null;
  const channelTitle = channelContext?.title || "Alex Vance & Team DispatchAI";

  const finalResponse = `Dear ${message.senderName},\n\n${agent2.draftDraft}\n\n${
    isSponsorship 
      ? `You can select a preferred 15-minute slot directly via our partner scheduling calendar: ${calendarUrl}\n\nBest regards,\n${channelTitle}` 
      : `Best regards,\n${channelTitle}`
  }`;

  return {
    artifactType: isSponsorship ? "COMMERCIAL_DEAL_MEMO" : agent1.category === "Support" ? "SUPPORT_RESOLUTION_DISPATCH" : agent1.category === "Video Feedback" ? "VIDEO_FEEDBACK_RESPONSE" : "COMMUNITY_NOTE",
    subjectLine: `Re: ${message.subject}`,
    recipient: message.email,
    schedulingLink: calendarUrl,
    suggestedAction: isSponsorship ? "DISPATCH_PROPOSAL_WITH_CALENDAR" : "DISPATCH_DIRECT_REPLY",
    readyToSend: true,
    fullDraft: finalResponse,
    meta: {
      urgency: agent1.urgencyScore,
      senderOrganization: message.organization,
      dealValueEstimate: isSponsorship ? "$4,500 - $12,000 USD" : "N/A",
      auditTrailId: `DSP-${Date.now().toString(36).toUpperCase()}`
    }
  };
}

function parseJsonSafe(rawText, fallbackFn) {
  try {
    const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.warn("JSON parse error on LLM response, returning fallback:", err);
    return fallbackFn();
  }
}
