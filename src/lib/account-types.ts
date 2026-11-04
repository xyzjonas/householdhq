import type { SourceType } from "#lib/server/core/types.ts";

export interface AccountTypeOption {
  type: SourceType;
  label: string;
  description: string;
}

export const accountTypeOptions: AccountTypeOption[] = [
  {
    type: "ACCOUNT",
    label: "Bank account",
    description: "Daily banking · checking accounts",
  },
  {
    type: "CASH",
    label: "Cash",
    description: "Physical cash and wallets",
  },
  {
    type: "SAVINGS",
    label: "Savings",
    description: "Savings accounts and vaults",
  },
  {
    type: "INVESTMENT",
    label: "Investment",
    description: "Brokerage accounts, ETFs and other assets",
  },
  {
    type: "DEBT",
    label: "Debt",
    description: "Loans, mortgages and other liabilities",
  },
  {
    type: "OUT",
    label: "External",
    description: "Money outside the household (shops, employers…)",
  },
];

export function accountTypeLabel(type: SourceType): string {
  return accountTypeOptions.find((o) => o.type === type)?.label ?? type;
}
