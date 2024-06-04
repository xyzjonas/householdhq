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
  parentId?: number;
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

export interface SourceApi {
  id: number;
  name: string;
  isOut: boolean;
  isDisponible: boolean;
  isPortfolio: boolean;
  states: SourceState[];
  color: string;
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

  category: Category;

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

  categoryId?: number;

  sourceId: number;
  targetId: number;

  tags?: string;
}

export interface Summary {
  month: number;
  year: number;
  amount: number;
}
