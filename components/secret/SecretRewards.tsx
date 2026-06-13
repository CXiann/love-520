"use client";

import { ChoreTicketsReveal } from "./ChoreTicketsReveal";
import { PotteryTicketReveal } from "./PotteryTicketReveal";

type SecretRewardsProps = {
  embedded?: boolean;
};

/** Grand unlock gifts: pottery ticket + five chore orders */
export function SecretRewards({ embedded = false }: SecretRewardsProps) {
  return (
    <div className="w-full">
      <PotteryTicketReveal embedded={embedded} />
      <ChoreTicketsReveal embedded={embedded} />
    </div>
  );
}
