import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable()
export class ApiLoggingInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only log product API requests
    if (request.url.includes('/api/products')) {
      console.log('API Request:', request.method, request.url);
      console.log('Request params:', request.params.toString());
    }

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse && request.url.includes('/api/products')) {
          console.log('API Response Status:', event.status);

          // If this is a product list response, log the count
          // Use type guard to ensure event.body is an object before using 'in' operator
          if (event.body && typeof event.body === 'object' && 'data' in event.body && Array.isArray((event.body as any).data)) {
            console.log('Product count in response:', (event.body as any).data.length);
          }
        }
      })
    );
  }
}
