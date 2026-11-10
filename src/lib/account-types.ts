import { m } from "#paraglide/messages.js";
import type { SourceType } from "#lib/server/core/types.ts";

export interface AccountTypeOption {
  type: SourceType;
  label: string;
  description: string;
}

/** The selectable account types; text is read lazily so it follows the locale. */
export function accountTypeOptions(): AccountTypeOption[] {
  return [
    {
      type: "ACCOUNT",
      label: m.accounts_type_account_label(),
      description: m.accounts_type_account_desc(),
    },
    {
      type: "CASH",
      label: m.accounts_type_cash_label(),
      description: m.accounts_type_cash_desc(),
    },
    {
      type: "SAVINGS",
      label: m.accounts_type_savings_label(),
      description: m.accounts_type_savings_desc(),
    },
    {
      type: "INVESTMENT",
      label: m.accounts_type_investment_label(),
      description: m.accounts_type_investment_desc(),
    },
    {
      type: "RETIREMENT",
      label: m.accounts_type_retirement_label(),
      description: m.accounts_type_retirement_desc(),
    },
    {
      type: "DEBT",
      label: m.accounts_type_debt_label(),
      description: m.accounts_type_debt_desc(),
    },
    {
      type: "OUT",
      label: m.accounts_type_out_label(),
      description: m.accounts_type_out_desc(),
    },
  ];
}

export function accountTypeLabel(type: SourceType): string {
  return accountTypeOptions().find((o) => o.type === type)?.label ?? type;
}
