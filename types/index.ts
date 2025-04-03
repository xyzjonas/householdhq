/* @unocss-include */

export interface User {
  id: number;
  email: string;
  password: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  // parentId?: number;
}

export interface CreateCategory {
  name: string;
}


export interface Tag {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;

  parentId: number;
  parentTag: Tag;
  childTags: Tag[];

  transactions: Transaction[];
}

export interface CategoryWithSum extends Category {
  sum: number;
  transactions: Transaction[];
}

export interface SourceState {
  id: number;
  created: Date;
  amount: number;
  source: Source;
}

export type SourceType = "ACCOUNT" | "OUT" | "CASH" | "SAVINGS" | "INVESTMENT" | "DEBT"
export const SourceTypes = ["ACCOUNT", "OUT", "CASH", "SAVINGS", "INVESTMENT", "DEBT"]
export const sourceIcons: { [key in SourceType]: string } = {
  ACCOUNT: "i-ic-baseline-account-balance",
  CASH: "i-ic-baseline-wallet",
  DEBT: "i-ic-baseline-money-off",
  INVESTMENT: "i-ic-baseline-ssid-chart",
  OUT: "i-ic-baseline-exit-to-app",
  SAVINGS: "i-ic-outline-savings",
};

export interface SourceApi {
  id: number;
  name: string;
  isOut: boolean;
  isDisponible: boolean;
  isPortfolio: boolean;
  states: SourceState[];
  color: string;
  position: number;
  type: SourceType;
}

export interface Source extends SourceApi {
  transactionsIn: Transaction[];
  transactionsOut: Transaction[];
  sum: number;
}

export interface CreateSource {
  name: string;
}

export interface DeleteSource {
  id: number;
}

export interface Transaction {
  id: number;
  // created: Date;
  transactedAt: Date;
  description: string;
  amount: number;
  currency: string;
  cancelled: boolean;
  confirmed: boolean;
  recurring: number;
  isImportant: boolean;
  isHidden: boolean;
  category: Category;
  projectId: number;
  project: Project;

  source: Source;
  target: Source;

  tags: Tag[];
}

export interface CreateUpdateTransaction {
  id?: number;
  // created?: string;
  transactedAt?: string;
  description?: string;
  amount: number;
  currency?: string;
  cancelled?: boolean;
  confirmed?: boolean;
  recurring: number;
  isImportant: boolean;
  isHidden: boolean;

  categoryId?: number;

  sourceId: number;
  targetId: number;
  projectId?: number;

  tags?: string;
}

export interface Summary {
  month: number;
  year: number;
  amount: number;
}


export interface ProjectApi {
  id: number;
  name: string;
  description: string;
  created: Date;
  isCompleted: boolean;
  transactions: Transaction[];
  estimate: number;
  color?: string;
}

export interface Project extends ProjectApi {}

export interface CreateProject extends Omit<ProjectApi, "id" | "created" | "transactions" | "isComplete"> {

}
