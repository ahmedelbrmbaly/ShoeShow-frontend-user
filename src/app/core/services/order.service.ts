import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = environment.apiUrl + '/api/users';

  constructor(private http: HttpClient) {}

  getOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/${userId}/orders`);
  }

  placeOrder(userId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userId}/orders`, {});
  }
}
