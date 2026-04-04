import { UserStats, Badge, LootboxType, Prize, Rule } from "../types";

// Mock data generators
const mockStats: UserStats = {
  pointsBalance: 2500,
  lifetimeEarned: 5000,
  lifetimeSpent: 2500,
  badgesCount: 3,
  totalSpins: 12,
};

const mockBadges: Badge[] = [
  {
    id: "badge-1",
    name: "Early Adopter",
    description: "Joined in the first month",
    metadataUri: "ipfs://QmExample1",
    maxSupply: 100,
    transferable: false,
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "badge-2",
    name: "Power User",
    description: "Completed 10 transactions",
    metadataUri: "ipfs://QmExample2",
    maxSupply: 500,
    transferable: true,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "badge-3",
    name: "Community Hero",
    description: "Referred 5 users",
    metadataUri: "ipfs://QmExample3",
    maxSupply: 1000,
    transferable: false,
    createdAt: new Date("2024-02-01"),
  },
];

const mockLootboxes: LootboxType[] = [
  {
    id: "lootbox-1",
    name: "Bronze Spin",
    pointsCost: 100,
    nativeCost: null,
    cooldownSeconds: 300,
  },
  {
    id: "lootbox-2",
    name: "Silver Spin",
    pointsCost: 250,
    nativeCost: 0.01,
    cooldownSeconds: 600,
  },
  {
    id: "lootbox-3",
    name: "Gold Spin",
    pointsCost: 500,
    nativeCost: 0.05,
    cooldownSeconds: 900,
  },
];

const mockPrizes: Prize[] = [
  {
    id: "prize-1",
    type: "POINTS",
    label: "100 Points",
    value: "100",
    weightBps: 4000,
  },
  {
    id: "prize-2",
    type: "BADGE",
    label: "Mystery Badge",
    value: "badge-mystery",
    weightBps: 3000,
  },
  {
    id: "prize-3",
    type: "NATIVE",
    label: "0.01 ETH",
    value: "10000000000000000",
    weightBps: 2000,
  },
  {
    id: "prize-4",
    type: "ERC20",
    label: "100 USDC",
    value: "100000000",
    weightBps: 1000,
  },
];

const mockRules: Rule[] = [
  {
    id: "rule-1",
    name: "Welcome Bonus",
    trigger: { id: "t1", type: "CUSTOM", label: "First Login" },
    conditions: [],
    actions: [{ id: "a1", type: "GRANT_POINTS", payload: { amount: 100 } }],
    enabled: true,
  },
];

// Delay helper for realistic API simulation
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API functions
export const mockApi = {
  async fetchUserStats(address: string) {
    await delay(500);
    return mockStats;
  },

  async fetchUserBadges(address: string) {
    await delay(400);
    return mockBadges;
  },

  async fetchAllBadges() {
    await delay(300);
    return mockBadges;
  },

  async registerBadge(badgeData: any) {
    await delay(500);
    return {
      id: `badge-${Date.now()}`,
      ...badgeData,
      createdAt: new Date(),
    };
  },

  async fetchLootboxTypes() {
    await delay(400);
    return mockLootboxes;
  },

  async registerLootboxType(lootboxData: any) {
    await delay(500);
    return {
      id: `lootbox-${Date.now()}`,
      ...lootboxData,
    };
  },

  async fetchPrizes() {
    await delay(400);
    return mockPrizes;
  },

  async updatePrizeWeights(prizes: any[]) {
    await delay(600);
    return { success: true };
  },

  async commitSpin(lootboxId: string) {
    await delay(800);
    return {
      commitmentHash: `0x${Math.random().toString(16).slice(2)}`,
    };
  },

  async revealSpin(commitmentHash: string) {
    await delay(2000);
    const prizeIndex = Math.floor(Math.random() * mockPrizes.length);
    const prize = mockPrizes[prizeIndex];
    return {
      transactionHash: `0x${Math.random().toString(16).slice(2)}`,
      label: prize.label,
      prizeType: prize.type,
      value: prize.value,
      attestationUID: `0xatt${Math.random().toString(16).slice(2)}`,
    };
  },

  async claimBadge(badgeId: string) {
    await delay(600);
    return { success: true };
  },

  async fetchAttestationProof(attestationUID: string) {
    await delay(400);
    return {
      attestationUID,
      data: "Mock attestation proof from EAS",
    };
  },

  async getRules() {
    await delay(300);
    return mockRules;
  },

  async createRule(rule: any) {
    await delay(500);
    return { id: `rule-${Date.now()}`, ...rule };
  },

  async updateRule(ruleId: string, rule: any) {
    await delay(500);
    return { id: ruleId, ...rule };
  },

  async deleteRule(ruleId: string) {
    await delay(400);
    return { success: true };
  },
};
