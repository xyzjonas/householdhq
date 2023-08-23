
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
  
  
export interface Tag {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
  
    parentId: number
    parentTag: Tag;
    childTags: Tag[];
  
    transactions:  Transaction[];
}

export interface TagWithSum extends Tag {
    sum: number;
    transactions: Transaction[];
}

  
export interface SourceState {
    id: number
    created: Date
    amount: number
    source: Source;
}

export interface SourceApi {
    id: number
    name: string;
    isOut: boolean;
    isDisponible: boolean;
    states: SourceState[];
    color: string;
}

export interface Source extends SourceApi {
    transactionsIn: Transaction[];
    transactionsOut: Transaction[];
    sum: number;
  }
    
    
export interface Transaction {
    id: number
    created: Date;
    description: string;
    amount: number;
    currency: string;
    cancelled: boolean;
    confirmed: boolean;
    recurring: number;
    
    category?: Category;
  
    source: Source;
    target: Source;
  
    tags: Tag[];
  
}

export interface CreateUpdateTransaction {
[x: string]: any;
    id?: number;
    created?: Date;
    description?: string;
    amount: number;
    currency: string;
    cancelled: boolean;
    confirmed: boolean;
    recurring: number;
    
    categoryId?: number;
  
    sourceId: number;
    targetId: number;

    tags: string[];

}
