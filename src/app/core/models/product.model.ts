export interface ProductSummary {
    productId: number;
    name: string;
    price: number;
    img: string;
}

export interface ProductInfo {
    productInfoId: number;
    color: string;
    size: string;
    quantity: number;
}

export interface Product {
    productId: number;
    name: string;
    description: string;
    price: number;
    img: string[];
    productInfos: ProductInfo[];
}

export interface CartItem {
    itemId: number;
    productId: number;
    productInfoId: number;
    userId: number;
    name: string;
    size: number;
    color: string;
    price: number;
    quantity: number;
    img: string;
    addedAt: string;
}

export interface WishlistItem {
    productId: number;
    name: string;
    price: number;
    img: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    totalPages: number;
    totalElements: number;
    currentPage: number;
}

export type ProductGender = 'MALE' | 'FEMALE';
export type ProductCategory = 'SNEAKERS' | 'CLASSIC' | 'CASUAL';
export type ProductOrderBy = 'newArrival' | 'bestseller';

export interface ProductFilters {
    brand?: string[];
    size?: string[];
    color?: string[];
    orderBy?: ProductOrderBy;
    gender?: ProductGender;
    category?: ProductCategory;
    keyWord?: string;
    pageNumber?: number;
    pageSize?: number;
}
