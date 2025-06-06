import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = 'http://localhost:8081/api/users';

  constructor(private http: HttpClient) {}

  getOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/${userId}/orders`);
  }

  placeOrder(userId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userId}/orders`, {});
  }
}
