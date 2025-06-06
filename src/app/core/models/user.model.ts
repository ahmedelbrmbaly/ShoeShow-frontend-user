export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    userId: number;
    token: string;
}

export interface RegisterRequest {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
    buildingNumber: number;
    street: string;
    state: string;
    creditLimit: number;
    job: string;
    interest: string;
    birthdate: string;
}

export interface Address {
    addressId: number;
    buildingNumber: number;
    street: string;
    state: string;
    isDefault: boolean;
}

export interface Order {
    orderId: number;
    totalAmount: number;
    createdAt: string;
    orderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
}

export interface User {
    userId: number;
    name: string;
    phoneNumber: string;
    email: string;
    birthdate: string;
    job: string;
    creditLimit: number;
    interests: string;
    addresses: Address[];
    orders: Order[];
}
