/** Shared slower motion timing for the babies shelf */
export const dollEase = [0.22, 1, 0.36, 1] as const;

export const dollSpringSlow = {
  type: "spring" as const,
  stiffness: 60,
  damping: 18,
};

export const dollEnter = {
  duration: 1.35,
  ease: dollEase,
};

export const dollStagger = 0.2;

export const dollSaveUnlock = {
  duration: 1.5,
  ease: dollEase,
};

/** Pause before quest advances after save button */
export const dollSaveDelayMs = 1600;
