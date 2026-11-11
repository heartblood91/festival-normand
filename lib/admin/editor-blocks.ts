export type CalloutVariant = "info" | "important"

export const parseCalloutVariant = (value: string | null | undefined): CalloutVariant =>
  value === "important" ? "important" : "info"
