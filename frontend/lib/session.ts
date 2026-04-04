import { SessionOptions } from "iron-session";

export interface SessionData {
  nonce?: string;
  siwe?: {
    address: string;
    chainId: number;
  };
}

export const sessionOptions: SessionOptions = {
  cookieName: "chainloyalty_session",
  password: process.env.SESSION_SECRET ?? "chainloyalty-super-secret-key-that-is-at-least-32-characters-long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
  },
};

