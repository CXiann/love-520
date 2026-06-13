export const CHORE_TICKET_COUNT = 5;

export const CHORE_TICKET_STORAGE_KEY = "love520_chore_tickets_redeemed";

/** Set only after a successful POST to /api/auth/secret this browser session. */
export const SECRET_REWARDS_UNLOCK_KEY = "love520_secret_rewards_unlock";

export function unlockSecretRewardsStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SECRET_REWARDS_UNLOCK_KEY, "1");
}

export function isSecretRewardsUnlockedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SECRET_REWARDS_UNLOCK_KEY) === "1";
}

export type ChoreTicket = {
  number: number;
  label: string;
};

/** Five official chore orders — one use each */
export const CHORE_TICKETS: ChoreTicket[] = [
  { number: 1, label: "One chore — your call" },
  { number: 2, label: "One chore — your call" },
  { number: 3, label: "One chore — your call" },
  { number: 4, label: "One chore — your call" },
  { number: 5, label: "One chore — your call" },
];
