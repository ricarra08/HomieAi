export const savedHomeKeys = {
  all: (userId: string) => ["saved-homes", userId] as const,
};

export const dealKeys = {
  all: (userId: string) => ["deals", "list", userId] as const,
  detail: (dealId: string) => ["deals", dealId] as const,
};

export const offerKeys = {
  detail: (dealId: string) => ["offer-details", dealId] as const,
};

export const documentKeys = {
  list: (dealId: string) => ["documents", dealId] as const,
};

export const deadlineKeys = {
  list: (dealId: string) => ["deadlines", dealId] as const,
};

export const loanEstimateKeys = {
  list: (dealId: string) => ["loan-estimates", dealId] as const,
};

export const repairItemKeys = {
  list: (dealId: string) => ["repair-items", dealId] as const,
};

export const insuranceKeys = {
  list: (dealId: string) => ["insurance-info", dealId] as const,
};

export const collaboratorKeys = {
  list: (dealId: string) => ["collaborator-links", dealId] as const,
};

export const copilotKeys = {
  messages: (dealId: string | null) => ["copilot-messages", dealId] as const,
};
