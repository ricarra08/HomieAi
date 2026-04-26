export const savedHomeKeys = {
  all: (userId: string) => ["saved-homes", userId] as const,
};

export const transactionKeys = {
  all: (userId: string) => ["transactions", "list", userId] as const,
  detail: (transactionId: string) => ["transactions", transactionId] as const,
};

export const offerKeys = {
  detail: (transactionId: string) => ["offer-details", transactionId] as const,
};

export const documentKeys = {
  list: (transactionId: string) => ["documents", transactionId] as const,
};

export const deadlineKeys = {
  list: (transactionId: string) => ["deadlines", transactionId] as const,
};

export const loanEstimateKeys = {
  list: (transactionId: string) => ["loan-estimates", transactionId] as const,
};

export const repairItemKeys = {
  list: (transactionId: string) => ["repair-items", transactionId] as const,
};

export const insuranceKeys = {
  list: (transactionId: string) => ["insurance-info", transactionId] as const,
};

export const collaboratorKeys = {
  list: (transactionId: string) => ["collaborator-links", transactionId] as const,
};

export const copilotKeys = {
  messages: (transactionId: string | null) => ["copilot-messages", transactionId] as const,
};
