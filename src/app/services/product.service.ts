import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {Product} from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private _http:HttpClient) {
  }

  getAllProducts(): Observable<Product[]> {
    return this._http.get<{products:Product[]}>('https://dummyjson.com/products?limit=0')
    .pipe(map(response => response.products));
  }

  getCategories(): Observable<string[]> {
    return this._http.get<string[]>('https://dummyjson.com/products/category-list');
  }

  getProductById(id: number):Observable<Product> {
    return this._http.get<Product>(`https://dummyjson.com/products/${id}`);
  }
}
