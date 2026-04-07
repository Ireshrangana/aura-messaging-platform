const seed = {
  users: [
    {
      displayName: "Maya Chen",
      email: "maya@aura.app",
      bio: "Product lead shaping the next-gen inbox.",
      status: "Reviewing launch copy"
    },
    {
      displayName: "Avery Stone",
      email: "avery@aura.app",
      bio: "Operations and trust systems.",
      status: "Monitoring device approvals"
    }
  ],
  adminUsers: [
    {
      email: "ops@aura.app",
      role: "SUPER_ADMIN"
    },
    {
      email: "moderation@aura.app",
      role: "MODERATOR"
    }
  ],
  chats: [
    {
      title: "Launch Team",
      type: "GROUP",
      messages: [
        "Unread summary ready for launch approvals.",
        "Arabic CTA still needs a warmer rewrite before publishing."
      ]
    },
    {
      title: "Maya Chen",
      type: "DIRECT",
      messages: [
        "Can you summarize what I missed?",
        "Absolutely. Three key updates and one blocker."
      ]
    }
  ],
  reports: [
    {
      category: "phishing",
      reason: "Suspicious shortened link in group chat",
      status: "OPEN"
    }
  ]
};

console.log(JSON.stringify(seed, null, 2));
