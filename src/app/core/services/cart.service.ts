import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly API_URL = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  getCart(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.API_URL}/${userId}/cart`);
  }

  addToCart(userId: number, item: { productInfoId: number; productId: number; quantity: number }): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userId}/cart`, item);
  }

  updateCartItem(userId: number, item: { productInfoId: number; productId: number; quantity: number }): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/${userId}/cart`, item);
  }

  removeFromCart(userId: number, itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}/cart/items/${itemId}`);
  }

  placeOrder(userId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userId}/orders`, {});
  }
}
