import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WishlistItem } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly API_URL = `${environment.apiUrl}/api/users`;

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
