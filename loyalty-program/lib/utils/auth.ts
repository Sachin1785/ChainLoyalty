import { ethers } from "ethers";
import Cookie from "js-cookie";
import { WalletSession } from "../types";

const MESSAGE_TEMPLATE = `Welcome to LoyaltyBadge!

Sign this message to authenticate your wallet.

Wallet Address: {address}
Issued At: {issuedAt}
Statement: I authorize this signature for secure wallet authentication.`;

export async function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  return null;
}

export async function getSigner() {
  const provider = await getProvider();
  if (!provider) throw new Error("No Ethereum provider found");
  return provider.getSigner();
}

export async function getConnectedAddress(): Promise<string> {
  const signer = await getSigner();
  return signer.getAddress();
}

export function generateAuthMessage(address: string): string {
  const now = new Date();
  const issuedAt = now.toISOString();

  return MESSAGE_TEMPLATE.replace("{address}", address).replace(
    "{issuedAt}",
    issuedAt
  );
}

export async function signMessage(message: string): Promise<string> {
  const signer = await getSigner();
  return signer.signMessage(message);
}

export async function authenticateWallet(): Promise<WalletSession> {
  const address = await getConnectedAddress();
  const message = generateAuthMessage(address);
  const signature = await signMessage(message);
  const issuedAt = new Date().toISOString();

  const session: WalletSession = {
    address,
    signature,
    message,
    timestamp: Date.now(),
    issuedAt,
  };

  // Store in cookie
  Cookie.set("wallet_session", JSON.stringify(session), { expires: 7 });

  return session;
}

export function getStoredSession(): WalletSession | null {
  const stored = Cookie.get("wallet_session");
  return stored ? JSON.parse(stored) : null;
}

export function clearSession(): void {
  Cookie.remove("wallet_session");
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calculateWeightPercentage(weightBps: number): number {
  return (weightBps / 10000) * 100;
}

export async function verifySignature(
  address: string,
  message: string,
  signature: string
): Promise<boolean> {
  try {
    const recovered = ethers.verifyMessage(message, signature);
    return recovered.toLowerCase() === address.toLowerCase();
  } catch (error) {
    return false;
  }
}
