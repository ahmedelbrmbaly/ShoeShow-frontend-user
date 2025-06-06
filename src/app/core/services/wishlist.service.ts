import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WishlistItem } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getWishlist(userId: number): Observable<WishlistItem[]> {
    return this.http.get<WishlistItem[]>(`${this.API_URL}/${userId}/wishlist`);
  }

  addToWishlist(userId: number, productIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userId}/wishlist`, productIds);
  }

  removeFromWishlist(userId: number, productId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}/wishlist/${productId}`);
  }
}
