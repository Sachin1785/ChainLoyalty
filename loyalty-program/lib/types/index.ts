export interface Badge {
  id: string;
  name: string;
  description: string;
  metadataUri: string;
  maxSupply: number;
  transferable: boolean;
  createdAt: Date;
}

export interface BadgeType {
  id: string;
  name: string;
  description: string;
  image?: string;
  metadata?: Record<string, any>;
}

export interface LoyaltyPoints {
  supplyCap: number;
  transferable: boolean;
  decimals: number;
}

export interface LootboxType {
  id: string;
  name: string;
  pointsCost: number;
  nativeCost: number | null;
  cooldownSeconds: number;
}

export interface PrizeType {
  id: string;
  type: "NATIVE" | "ERC20" | "POINTS" | "BADGE";
  label: string;
  value: string;
  weightBps: number;
  icon?: string;
}

export interface Prize {
  id: string;
  type: PrizeType["type"];
  label: string;
  value: string;
  weightBps: number;
}

export interface SpinResult {
  transactionHash: string;
  label: string;
  prizeType: PrizeType["type"];
  value: string;
  attestationUID?: string;
}

export interface UserStats {
  pointsBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  badgesCount: number;
  totalSpins: number;
}

export interface Rule {
  id: string;
  name: string;
  trigger: TriggerNode;
  conditions: ConditionNode[];
  actions: ActionNode[];
  enabled: boolean;
}

export interface TriggerNode {
  id: string;
  type: "USER_PURCHASE" | "REFERRAL_MILESTONE" | "ACHIEVEMENT" | "CUSTOM";
  label: string;
  value?: string;
}

export interface ConditionNode {
  id: string;
  field: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte" | "contains";
  value: any;
}

export interface ActionNode {
  id: string;
  type: "GRANT_POINTS" | "AWARD_BADGE" | "TRIGGER_PRIZE";
  payload: Record<string, any>;
}

export interface WalletSession {
  address: string;
  signature: string;
  message: string;
  timestamp: number;
  issuedAt: string;
}
