import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, PaginatedResponse, ProductFilters, ProductCategory, ProductGender } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters?: ProductFilters): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    if (filters) {
      // Handle array parameters with possible null/undefined checks
      if (filters.brand?.length) {
        filters.brand.forEach(brand => {
          params = params.append('brand[]', brand);
        });
      }
      if (filters.size?.length) {
        filters.size.forEach(size => {
          params = params.append('size[]', size);
        });
      }
      if (filters.color?.length) {
        filters.color.forEach(color => {
          params = params.append('color[]', color);
        });
      }

      // Handle single value parameters
      if (filters.orderBy) params = params.append('orderBy', filters.orderBy);
      if (filters.gender) params = params.append('gender', filters.gender);
      if (filters.category) params = params.append('category', filters.category);
      if (filters.keyWord?.trim()) params = params.append('keyWord', filters.keyWord.trim());

      // Handle pagination with defaults
      params = params.append('pageNumber', (filters.pageNumber ?? 0).toString());
      params = params.append('pageSize', (filters.pageSize ?? 12).toString());
    } else {
      // Default pagination if no filters provided
      params = params.append('pageNumber', '0');
      params = params.append('pageSize', '12');
    }

    return this.http.get<PaginatedResponse<Product>>(this.API_URL, { params })
      .pipe(
        map(response => ({
          ...response,
          data: response.data.map(product => this.normalizeProductData(product))
        })),
        catchError(this.handleError)
      );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`)
      .pipe(
        map(product => this.normalizeProductData(product)),
        catchError(this.handleError)
      );
  }

  getBestSellers(limit: number = 12): Observable<PaginatedResponse<Product>> {
    return this.getProducts({
      orderBy: 'bestseller',
      pageSize: limit,
      pageNumber: 0
    });
  }

  getNewArrivals(limit: number = 12): Observable<PaginatedResponse<Product>> {
    return this.getProducts({
      orderBy: 'newArrival',
      pageSize: limit,
      pageNumber: 0
    });
  }

  searchProducts(keyword: string, filters?: Omit<ProductFilters, 'keyWord'>): Observable<PaginatedResponse<Product>> {
    return this.getProducts({
      ...filters,
      keyWord: keyword?.trim(),
      pageNumber: filters?.pageNumber ?? 0,
      pageSize: filters?.pageSize ?? 12
    });
  }

  getProductsByCategory(category: ProductCategory, filters?: Omit<ProductFilters, 'category'>): Observable<PaginatedResponse<Product>> {
    return this.getProducts({
      ...filters,
      category: category as ProductCategory,
      pageNumber: filters?.pageNumber ?? 0,
      pageSize: filters?.pageSize ?? 12
    });
  }

  getProductsByGender(gender: ProductGender, filters?: Omit<ProductFilters, 'gender'>): Observable<PaginatedResponse<Product>> {
    return this.getProducts({
      ...filters,
      gender: gender as ProductGender,
      pageNumber: filters?.pageNumber ?? 0,
      pageSize: filters?.pageSize ?? 12
    });
  }

  private normalizeProductData(product: Product): Product {
    return {
      ...product,
      // Handle both string and array image formats
      img: Array.isArray(product.img) ? product.img : [product.img],
      // Ensure price is a number
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
      // Ensure productInfos is sorted by size and exists
      productInfos: (product.productInfos ?? []).sort((a, b) => {
        const sizeA = parseInt(a.size.replace('SIZE_', ''));
        const sizeB = parseInt(b.size.replace('SIZE_', ''));
        return sizeA - sizeB;
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => errorMessage);
  }
}
