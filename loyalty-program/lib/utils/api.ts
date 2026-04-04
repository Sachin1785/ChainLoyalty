  import axios from "axios";
import { getStoredSession } from "./auth";
import { mockApi } from "./mock-api";

interface BackendBadge {
  id?: number;
  program_id: string;
  name: string;
  description: string;
  metadata_uri: string;
  max_supply: number;
  transferable: boolean;
  is_active: boolean;
  onchain_id?: number;
  point_value?: number;
}

function badgeToBackend(badge: any): BackendBadge {
  return {
    name: badge.name,
    description: badge.description,
    metadata_uri: badge.metadataUri,
    max_supply: badge.maxSupply || 0,
    transferable: badge.transferable || false,
    point_value: badge.pointValue || 0,
    program_id: "default",
    is_active: true
  };
}

function badgeFromBackend(b: BackendBadge): any {
  return {
    id: b.id?.toString(),
    onchainId: b.onchain_id,
    pointValue: b.point_value || 0,
    name: b.name,
    description: b.description,
    metadataUri: b.metadata_uri,
    maxSupply: b.max_supply,
    transferable: b.transferable,
    isActive: b.is_active
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// --- API Clients ---

const apiClient = axios.create({
  baseURL: API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`,
  timeout: 30000,
});

apiClient.interceptors.request.use((config) => {
  const session = getStoredSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.signature}`;
    config.headers["X-Wallet-Address"] = session.address;
  }
  return config;
});

const adminClient = axios.create({
  baseURL: API_BASE_URL.endsWith("/") ? `${API_BASE_URL}admin/` : `${API_BASE_URL}/admin/`,
  timeout: 30000,
});

adminClient.interceptors.request.use((config) => {
  const session = getStoredSession();
  if (session) {
    config.headers.Authorization = `Bearer ${session.signature}`;
    config.headers["X-Wallet-Address"] = session.address;
  }
  return config;
});

// Handle errors - fallback to mock API on network failure
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" && !USE_MOCK_API) {
      console.warn(
        "Network error: Falling back to mock API. Set NEXT_PUBLIC_USE_MOCK_API=true to suppress this warning."
      );
    }
    if (error.response?.status === 401) {
      localStorage.removeItem("wallet_session");
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Wrapper to prefer mock API or fallback on error
const callApi = async <T>(
  apiFn: () => Promise<any>,
  mockFn: () => Promise<T>
): Promise<T> => {
  if (USE_MOCK_API) {
    return mockFn();
  }

  try {
    const response = await apiFn();
    return response.data;
  } catch (error) {
    console.warn("API call failed, using mock data:", error);
    return mockFn();
  }
};

// --- API Functions ---

export async function fetchUserStats(address: string) {
  return callApi(
    () => apiClient.get(`users/${address}/stats`),
    () => mockApi.fetchUserStats(address)
  );
}

export async function fetchUserBadges(address: string) {
  return callApi(
    () => apiClient.get(`/users/${address}/badges`),
    () => mockApi.fetchUserBadges(address)
  );
}

export async function uploadBadgeImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return callApi(
    () => adminClient.post("/badges/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),
    async () => ({ url: "https://via.placeholder.com/150", filename: "mock.png" })
  );
}

export async function fetchAllBadges() {
  return callApi(
    async () => {
      const res = await adminClient.get("badges");
      return { data: res.data.map(badgeFromBackend) };
    },
    () => mockApi.fetchAllBadges()
  );
}

export async function registerBadge(badgeData: any) {
  return callApi(
    async () => {
      const payload = badgeToBackend(badgeData);
      return adminClient.post(`badges`, payload);
    },
    () => mockApi.registerBadge(badgeData)
  );
}

export async function mintBadgeTest(payload: { to_address: string; badge_id: number; onchain_badge_type_id?: number }) {
  return callApi(
    async () => {
      const params = new URLSearchParams();
      params.append("wallet_address", payload.to_address);
      params.append("badge_type_id", payload.badge_id.toString());
      if (payload.onchain_badge_type_id !== undefined) {
        params.append("onchain_badge_type_id", payload.onchain_badge_type_id.toString());
      }
      return adminClient.post(`badges/mint?${params.toString()}`);
    },
    async () => ({ data: { status: "success", mock: true } })
  );
}

export async function fetchLootboxTypes() {
  return callApi(
    () => apiClient.get(`lootboxes`),
    () => mockApi.fetchLootboxTypes()
  );
}

export async function registerLootboxType(lootboxData: any) {
  return callApi(
    () => apiClient.post(`lootboxes/register`, lootboxData),
    () => mockApi.registerLootboxType(lootboxData)
  );
}

export async function fetchPrizes() {
  return callApi(
    () => apiClient.get(`prizes`),
    () => mockApi.fetchPrizes()
  );
}

export async function updatePrizeWeights(prizes: any[]) {
  return callApi(
    () => apiClient.post(`prizes/update-weights`, { prizes }),
    () => mockApi.updatePrizeWeights(prizes)
  );
}

export async function commitSpin(lootboxId: string) {
  return callApi(
    () => apiClient.post(`spin/commit`, { lootboxId }),
    () => mockApi.commitSpin(lootboxId)
  );
}

export async function revealSpin(commitmentHash: string) {
  return callApi(
    () => apiClient.post(`spin/reveal`, { commitmentHash }),
    () => mockApi.revealSpin(commitmentHash)
  );
}

export async function claimBadge(badgeId: string) {
  return callApi(
    () => apiClient.post(`badges/claim`, { badgeId }),
    () => mockApi.claimBadge(badgeId)
  );
}

export async function fetchAttestationProof(attestationUID: string) {
  return callApi(
    () => apiClient.get(`attestations/${attestationUID}`),
    () => mockApi.fetchAttestationProof(attestationUID)
  );
}

// ── Type helpers ──────────────────────────────────────────────────────────────

export interface BackendRule {
  id?: number;
  name: string;
  program_id?: string;
  event_type: string;
  condition_json: Record<string, any>;
  reward_type: "points" | "badge";
  reward_value: number;
  automatic_mint?: boolean;
  is_active?: boolean;
}

export function ruleToBackend(rule: any): BackendRule {
  const triggerMap: Record<string, string> = {
    USER_PURCHASE: "purchase",
    REFERRAL_MILESTONE: "referral",
    ACHIEVEMENT: "achievement",
    CUSTOM: rule.trigger?.value || "custom",
  };
  const event_type = triggerMap[rule.trigger?.type] ?? rule.trigger?.type ?? "custom";

  const condition_json: Record<string, any> = {};
  for (const cond of rule.conditions ?? []) {
    if (cond.conditionType === "threshold" || cond.field === "amount") {
      condition_json.min_amount = Number(cond.value);
    } else if (cond.conditionType === "frequency" || cond.field === "frequency") {
      condition_json.frequency = Number(cond.value);
    } else if (cond.conditionType === "metadata") {
      condition_json.required_metadata = condition_json.required_metadata ?? {};
      condition_json.required_metadata[cond.field] = cond.value;
    } else {
      condition_json.required_metadata = condition_json.required_metadata ?? {};
      condition_json.required_metadata[cond.field] = cond.value;
    }
  }

  const firstAction = rule.actions?.[0];
  let reward_type: "points" | "badge" = "points";
  let reward_value = 0;
  if (firstAction) {
    if (firstAction.type === "AWARD_BADGE") {
      reward_type = "badge";
      reward_value = Number(firstAction.payload?.badgeId ?? firstAction.payload?.amount ?? 1);
    } else {
      reward_type = "points";
      reward_value = Number(firstAction.payload?.amount ?? 0);
    }
  }

  return {
    name: rule.name,
    event_type,
    condition_json,
    reward_type,
    reward_value,
    automatic_mint: rule.automaticMint !== false,
    is_active: rule.enabled !== false,
  };
}

export function ruleFromBackend(b: BackendRule & { id: number }): any {
  const reverseMap: Record<string, string> = {
    purchase: "USER_PURCHASE",
    referral: "REFERRAL_MILESTONE",
    achievement: "ACHIEVEMENT",
  };
  const triggerType = reverseMap[b.event_type] ?? "CUSTOM";

  const conditions: any[] = [];
  const c = b.condition_json ?? {};
  if (c.min_amount !== undefined) {
    conditions.push({ id: "c-threshold", conditionType: "threshold", field: "amount", operator: "gte", value: c.min_amount });
  }
  if (c.frequency !== undefined) {
    conditions.push({ id: "c-freq", conditionType: "frequency", field: "frequency", operator: "eq", value: c.frequency });
  }
  if (c.required_metadata) {
    Object.entries(c.required_metadata).forEach(([k, v], i) => {
      conditions.push({ id: `c-meta-${i}`, conditionType: "metadata", field: k, operator: "eq", value: v });
    });
  }

  const actions: any[] = [
    b.reward_type === "badge"
      ? { id: "a1", type: "AWARD_BADGE", payload: { badgeId: b.reward_value } }
      : { id: "a1", type: "GRANT_POINTS", payload: { amount: b.reward_value } },
  ];

  return {
    id: String(b.id),
    name: b.name,
    trigger: { id: "t1", type: triggerType, label: triggerType },
    conditions,
    actions,
    enabled: b.is_active !== false,
    automaticMint: b.automatic_mint !== false,
    _raw: b,
  };
}

// ── Admin Rules API ───────────────────────────────────────────────────────────

export async function getRules(programId = "default"): Promise<any[]> {
  return callApi(
    async () => {
      const res = await adminClient.get(`/rules`, { params: { program_id: programId } });
      return { data: res.data.map(ruleFromBackend) };
    },
    () => mockApi.getRules()
  );
}

export async function createRule(rule: any, programId = "default"): Promise<any> {
  const payload = ruleToBackend(rule);
  payload.program_id = programId;
  return callApi(
    async () => {
      const res = await adminClient.post(`/rules`, payload);
      return { data: ruleFromBackend(res.data) };
    },
    () => mockApi.createRule(rule)
  );
}

export async function updateRule(ruleId: string, rule: any): Promise<any> {
  const payload = ruleToBackend(rule);
  return callApi(
    async () => {
      const res = await adminClient.put(`/rules/${ruleId}`, payload);
      return { data: ruleFromBackend(res.data) };
    },
    () => mockApi.updateRule(ruleId, rule)
  );
}

export async function deleteRule(ruleId: string): Promise<any> {
  return callApi(
    () => adminClient.delete(`/rules/${ruleId}`),
    () => mockApi.deleteRule(ruleId)
  );
}

export default apiClient;
