import http from "node:http";

const port = Number(process.env.API_PORT ?? 4000);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });

async function parseBody<T>(req: http.IncomingMessage) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return {} as T;

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as T;
  } catch {
    return {} as T;
  }
}

const overview = {
  totalUsers: 182340,
  activeUsers: 64210,
  onlineUsers: 9142,
  dailyMessageVolume: 14600000,
  dailyActiveChats: 438000,
  flaggedMessages: 84,
  abuseReports: 29,
  blockedUsers: 1210,
  storageUsageGb: 912,
  aiUsageToday: 96440,
  recentIncidents: [
    "Phishing link cluster in Launch Team",
    "Spam join-link campaign blocked",
    "Moderator queue backlog cleared"
  ]
};

const users = [
  {
    id: "jordan",
    name: "Jordan Lee",
    email: "jordan.lee@aura.app",
    status: "active",
    devices: 2,
    reports: 0
  },
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya.chen@aura.app",
    status: "active",
    devices: 3,
    reports: 1
  }
];

const reports = [
  {
    id: "rep_1",
    category: "phishing",
    status: "open",
    reporter: "Jordan Lee",
    target: "Launch Team",
    reason: "Suspicious shortened link"
  },
  {
    id: "rep_2",
    category: "harassment",
    status: "reviewing",
    reporter: "Maya Chen",
    target: "user_avery",
    reason: "Repeated abusive replies"
  }
];

const analytics = {
  dau: [62000, 62800, 63550, 64210],
  mau: [155000, 161500, 170200, 182340],
  messageVolume: [12.8, 13.1, 14.0, 14.6],
  aiUsage: [71000, 81200, 90500, 96440]
};

const auditLogs = [
  {
    id: "audit_1",
    actor: "ops-root@aura-admin.app",
    action: "REPORT_ASSIGNED",
    resource: "rep_1",
    createdAt: "2026-04-06T05:40:00.000Z"
  },
  {
    id: "audit_2",
    actor: "moderation@aura-admin.app",
    action: "MESSAGE_REMOVED",
    resource: "msg_441",
    createdAt: "2026-04-06T05:42:00.000Z"
  }
];

const adminAccounts = [
  {
    id: "admin_root",
    username: "aura_root_admin",
    name: "Aura Root Admin",
    role: "super_admin",
    status: "active",
    createdAt: "2026-04-06T06:00:00.000Z"
  }
];

const passwordRequests = [
  {
    id: "password_request_seed",
    userId: "maya",
    userName: "Maya Chen",
    email: "maya.chen@aura.app",
    status: "approved",
    requestedAt: "2026-04-05T10:30:00.000Z",
    reviewedAt: "2026-04-05T11:10:00.000Z",
    reviewer: "Aura Root Admin"
  }
];

const userActionHistory: Record<string, Array<{ id: string; action: string; rationale: string; createdAt: string; actor: string }>> = {
  maya: [
    {
      id: "ua_1",
      action: "PASSWORD_APPROVED",
      rationale: "Approved after identity verification via ops channel.",
      createdAt: "2026-04-05T11:10:00.000Z",
      actor: "Aura Root Admin"
    }
  ],
  jordan: []
};

function appendAudit(actor: string, action: string, resource: string) {
  auditLogs.unshift({
    id: `audit_${Date.now()}`,
    actor,
    action,
    resource,
    createdAt: new Date().toISOString()
  });
}

function appendUserHistory(userId: string, action: string, rationale: string, actor: string) {
  const entry = {
    id: `ua_${Date.now()}`,
    action,
    rationale,
    createdAt: new Date().toISOString(),
    actor
  };

  userActionHistory[userId] = [entry, ...(userActionHistory[userId] ?? [])].slice(0, 20);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `127.0.0.1:${port}`}`);

  let response: Response;

  if (req.method === "OPTIONS") {
    response = json({ ok: true });
  } else if (req.method === "GET" && url.pathname === "/health") {
    response = json({ status: "ok", service: "aura-admin-preview" });
  } else if (req.method === "GET" && url.pathname === "/api/admin/dashboard/overview") {
    response = json(overview);
  } else if (req.method === "GET" && url.pathname === "/api/admin/users") {
    const q = url.searchParams.get("q")?.toLowerCase() ?? "";
    const status = url.searchParams.get("status");
    const filtered = users.filter((user) => {
      const matchesQuery =
        q.length === 0 ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.id.toLowerCase().includes(q);
      const matchesStatus = !status || status === "all" || user.status === status;
      return matchesQuery && matchesStatus;
    });
    response = json({ items: filtered, total: filtered.length });
  } else if (req.method === "GET" && url.pathname.startsWith("/api/admin/users/") && url.pathname.endsWith("/password-history")) {
    const userId = url.pathname.split("/")[4];
    response = json({ items: userActionHistory[userId] ?? [], total: (userActionHistory[userId] ?? []).length });
  } else if (req.method === "GET" && url.pathname.startsWith("/api/admin/users/")) {
    const id = url.pathname.split("/").pop();
    const user = users.find((item) => item.id === id);
    response = user ? json(user) : json({ message: "User not found" }, 404);
  } else if (req.method === "POST" && url.pathname.match(/^\/api\/admin\/users\/[^/]+\/actions$/)) {
    const userId = url.pathname.split("/")[4];
    const payload = await parseBody<{ action?: string; rationale?: string; actor?: string }>(req);
    const targetUser = users.find((item) => item.id === userId);

    if (!targetUser || !payload.action) {
      response = json({ message: "Invalid user action request" }, 400);
    } else {
      if (payload.action === "Suspend user") targetUser.status = "suspended";
      if (payload.action === "Ban user") targetUser.status = "banned";
      if (payload.action === "Reactivate user") targetUser.status = "active";

      appendAudit(payload.actor ?? "Aura Root Admin", "USER_ACTION_APPLIED", userId);
      appendUserHistory(userId, payload.action, payload.rationale ?? "No rationale provided.", payload.actor ?? "Aura Root Admin");

      response = json({
        ok: true,
        user: targetUser,
        action: payload.action
      });
    }
  } else if (req.method === "GET" && url.pathname === "/api/admin/reports") {
    response = json({ items: reports, total: reports.length });
  } else if (req.method === "GET" && url.pathname === "/api/admin/analytics/usage") {
    response = json(analytics);
  } else if (req.method === "GET" && url.pathname === "/api/admin/audit-logs") {
    response = json({ items: auditLogs, total: auditLogs.length });
  } else if (req.method === "GET" && url.pathname === "/api/admin/admin-accounts") {
    response = json({ items: adminAccounts, total: adminAccounts.length });
  } else if (req.method === "POST" && url.pathname === "/api/admin/admin-accounts") {
    const payload = await parseBody<{ username?: string; name?: string; role?: string }>(req);

    if (!payload.username || !payload.name || !payload.role) {
      response = json({ message: "Invalid admin account payload" }, 400);
    } else {
      const nextAccount = {
        id: `admin_${Date.now()}`,
        username: payload.username,
        name: payload.name,
        role: payload.role,
        status: "active",
        createdAt: new Date().toISOString()
      };
      adminAccounts.unshift(nextAccount);
      appendAudit("Aura Root Admin", "ADMIN_ACCOUNT_CREATED", nextAccount.id);
      response = json({ ok: true, account: nextAccount }, 201);
    }
  } else if (req.method === "GET" && url.pathname === "/api/admin/password-requests") {
    response = json({ items: passwordRequests, total: passwordRequests.length });
  } else if (req.method === "POST" && url.pathname.match(/^\/api\/admin\/password-requests\/[^/]+\/review$/)) {
    const requestId = url.pathname.split("/")[4];
    const payload = await parseBody<{ decision?: "approved" | "rejected"; actor?: string; rationale?: string }>(req);
    const requestItem = passwordRequests.find((item) => item.id === requestId);

    if (!requestItem || !payload.decision) {
      response = json({ message: "Invalid password review request" }, 400);
    } else {
      requestItem.status = payload.decision;
      requestItem.reviewedAt = new Date().toISOString();
      requestItem.reviewer = payload.actor ?? "Aura Root Admin";
      appendAudit(payload.actor ?? "Aura Root Admin", "PASSWORD_REQUEST_REVIEWED", requestItem.id);
      appendUserHistory(
        requestItem.userId,
        payload.decision === "approved" ? "PASSWORD_APPROVED" : "PASSWORD_REJECTED",
        payload.rationale ?? "Password review completed.",
        payload.actor ?? "Aura Root Admin"
      );
      response = json({ ok: true, request: requestItem });
    }
  } else if (req.method === "GET" && url.pathname === "/api/admin/routes") {
    response = json({
      endpoints: [
        "GET /api/admin/dashboard/overview",
        "GET /api/admin/users?q=&status=",
        "GET /api/admin/users/:id",
        "GET /api/admin/users/:id/password-history",
        "POST /api/admin/users/:id/actions",
        "GET /api/admin/reports",
        "GET /api/admin/analytics/usage",
        "GET /api/admin/audit-logs",
        "GET /api/admin/admin-accounts",
        "POST /api/admin/admin-accounts",
        "GET /api/admin/password-requests",
        "POST /api/admin/password-requests/:id/review"
      ]
    });
  } else {
    response = json({ message: "Not found" }, 404);
  }

  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  response
    .text()
    .then((body) => res.end(body))
    .catch(() => res.end('{"message":"response error"}'));
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Aura admin preview running at http://127.0.0.1:${port}`);
});
