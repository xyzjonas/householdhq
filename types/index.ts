/* @unocss-include */
import {
  type Category,
  CategorySchema,
  type CreateCategory,
  CreateCategorySchema,
  type EditCategory,
} from "./category";

import type {
  Meter,
  MeterState,
  MeterStateCreate,
  MeterStateUpdate,
  MeterUpdate,
  MeterCreate,
} from "./energy";

import {
  MeterSchema,
  MeterCreateSchema,
  MeterStateCreateSchema,
  MeterStateUpdateSchema,
  MeterUpdateSchema,
  MeterStateSchema,
} from "./energy";

import { type IDBase, IdSchema } from "./base";
import { LoginSchema, type LoginRequest } from "./auth";
import {
  CreateProjectSchema,
  EditProjectSchema,
  type CreateProjectRequest,
  type EditProjectRequest,
} from "./project";
import {
  CreateSourceSchema,
  EditSourceSchema,
  SourceTypeSchema,
  UpdateSourceStateSchema,
  type CreateSourceRequest,
  type EditSourceRequest,
  type SourceTypeRequest,
  type UpdateSourceStateRequest,
} from "./source";
import {
  CreateTagSchema,
  EditTagSchema,
  type CreateTagRequest,
  type EditTagRequest,
} from "./tag";
import {
  CreateTransactionSchema,
  EditTransactionSchema,
  TagTransactionSchema,
  TransactionFiltersSchema,
  TransactionMonthSchema,
  type CreateTransactionRequest,
  type EditTransactionRequest,
  type TagTransactionRequest,
  type TransactionFiltersRequest,
  type TransactionMonthRequest,
} from "./transaction";

import {
  VehicleSchema,
  VehicleCreateSchema,
  VehicleUpdateSchema,
  type Vehicle,
  type VehicleCreate,
  type VehicleUpdate,
} from "./vehicles";

export type {
  Category,
  CreateCategory,
  EditCategory,
  IDBase,
  Meter,
  MeterState,
  MeterStateCreate,
  MeterStateUpdate,
  MeterUpdate,
  MeterCreate,
  LoginRequest,
  CreateProjectRequest,
  EditProjectRequest,
  CreateSourceRequest,
  EditSourceRequest,
  SourceTypeRequest,
  UpdateSourceStateRequest,
  CreateTagRequest,
  EditTagRequest,
  CreateTransactionRequest,
  EditTransactionRequest,
  TagTransactionRequest,
  TransactionFiltersRequest,
  TransactionMonthRequest,
  Vehicle,
  VehicleCreate,
  VehicleUpdate,
};

export {
  CategorySchema,
  CreateCategorySchema,
  IdSchema,
  LoginSchema,
  CreateProjectSchema,
  EditProjectSchema,
  CreateSourceSchema,
  EditSourceSchema,
  SourceTypeSchema,
  UpdateSourceStateSchema,
  CreateTagSchema,
  EditTagSchema,
  TransactionMonthSchema,
  TransactionFiltersSchema,
  CreateTransactionSchema,
  EditTransactionSchema,
  TagTransactionSchema,
  MeterSchema,
  MeterCreateSchema,
  MeterStateCreateSchema,
  MeterStateUpdateSchema,
  MeterUpdateSchema,
  MeterStateSchema,
  VehicleSchema,
  VehicleCreateSchema,
  VehicleUpdateSchema,
};

export interface User {
  id: number;
  email: string;
  password: string;
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

export type SourceType =
  | "ACCOUNT"
  | "OUT"
  | "CASH"
  | "SAVINGS"
  | "INVESTMENT"
  | "DEBT";
export const SourceTypes = [
  "ACCOUNT",
  "OUT",
  "CASH",
  "SAVINGS",
  "INVESTMENT",
  "DEBT",
];
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

export interface CreateProject extends Omit<
  ProjectApi,
  "id" | "created" | "transactions" | "isComplete"
> {}
