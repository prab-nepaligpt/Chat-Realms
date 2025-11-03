export type TokenResponse = {
  access_token: string;
  token_type: string; // e.g. "bearer"
};

const BASE_URL = (import.meta as any).env?.VITE_CHAT_REALMS_BACKEND || (import.meta as any).env?.CHAT_REALMS_BACKEND || "";
const NGROK_BYPASS: Record<string, string> = BASE_URL.includes("ngrok")
  ? { "ngrok-skip-browser-warning": "true" }
  : {};

if (!BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("CHAT_REALMS_BACKEND is not set. Create a .env with VITE_CHAT_REALMS_BACKEND=https://your-api");
}

export const storage = {
  setToken: (t: TokenResponse) => {
    localStorage.setItem("auth_token", JSON.stringify(t));
  },
  getToken: (): TokenResponse | null => {
    const raw = localStorage.getItem("auth_token");
    if (!raw) return null;
    try { return JSON.parse(raw) as TokenResponse; } catch { return null; }
  },
  clear: () => localStorage.removeItem("auth_token"),
};

export const authApi = {
  // /login expects form-url-encoded, schema fields: username, password, grant_type?, scope?, client_id?, client_secret?
  async login(username: string, password: string): Promise<TokenResponse> {
    const body = new URLSearchParams({ username, password });
    // Optional fields present in schema but typically empty for password grant
    // body.set("grant_type", "password");
    // body.set("scope", "");
    // body.set("client_id", "");
    // body.set("client_secret", "");

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", ...NGROK_BYPASS, Accept: "application/json" },
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Login failed (${res.status})`);
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(text || 'Login response was not JSON');
    }
    const data = (await res.json()) as TokenResponse;
    return data;
  },

  // /register expects JSON: { name, email, password, description }
  async register(params: { name: string; email: string; password: string; description?: string | null }): Promise<void> {
    if (!params.description || params.description.trim().length === 0) {
      throw new Error('Description is required for registration');
    }
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...NGROK_BYPASS, Accept: "application/json" },
      body: JSON.stringify({
        name: params.name,
        email: params.email,
        password: params.password,
        description: params.description,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Register failed (${res.status})`);
    }
  },
  async logout(): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/logout`, {
      method: "GET",
      headers: { ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
    });
    // Some backends return 204/200 without body; treat non-OK as error, but still allow local logout fallback
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Logout failed (${res.status})`);
    }
  },
  async changePassword(input: { current_password: string; new_password: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/change-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Change password failed (${res.status})`);
    }
  },

  async getRequests(): Promise<Array<{ from_name: string; to_name: string; group_name: string }>> {
    const res = await fetch(`${BASE_URL}/api/requests`, {
      method: "GET",
      headers: { ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Fetch requests failed (${res.status})`);
    }
    if (res.status === 204) return [];
    const data = (await res.json()) as Array<{ from_name: string; to_name: string; group_name: string }>;
    return data;
  },

  async respondToRequest(input: { group_name: string; response: boolean }): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/respond_to_request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Respond to request failed (${res.status})`);
    }
  },

  async getAgents(): Promise<Array<{ name: string; description: string | null }>> {
    const res = await fetch(`${BASE_URL}/api/agents`, {
      method: "GET",
      headers: { ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Fetch agents failed (${res.status})`);
    }
    if (res.status === 204) return [];
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(text || 'Agents response was not JSON');
    }
    const data = (await res.json()) as Array<{ name: string; description: string | null }>;
    return data;
  },

  async assignAgentToGroup(params: { agent_name: string; group_name: string }): Promise<void> {
    const { agent_name, group_name } = params;
    const res = await fetch(`${BASE_URL}/api/assign_agent/${encodeURIComponent(agent_name)}/to_group/${encodeURIComponent(group_name)}`, {
      method: "POST",
      headers: { ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Assign agent failed (${res.status})`);
    }
  },
};

export function authHeader() {
  const t = storage.getToken();
  if (!t) return {} as Record<string, string>;
  return { Authorization: `${t.token_type ?? "Bearer"} ${t.access_token}` };
}

// Group models based on provided schemas
export type RegisterGroup = {
  name: string;
  description: string | null;
};

export type GetGroup = {
  name: string;
  description: string | null;
  id?: string | number; // optional fallback if backend adds it
};

export const groupApi = {
  async addGroup(input: RegisterGroup): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/add_group`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Add group failed (${res.status})`);
    }
  },

  async myGroups(): Promise<GetGroup[]> {
    const res = await fetch(`${BASE_URL}/api/my_groups`, {
      method: "GET",
      headers: { ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Fetch groups failed (${res.status})`);
    }
    if (res.status === 204) {
      // No groups yet
      return [];
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text();
      throw new Error(text || 'Groups response was not JSON');
    }
    const data = (await res.json()) as GetGroup[];
    return data;
  },

  async sendJoinRequest(input: { to_name: string; group_name: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/send_request`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeader(), ...NGROK_BYPASS, Accept: "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Send join request failed (${res.status})`);
    }
  },
};
