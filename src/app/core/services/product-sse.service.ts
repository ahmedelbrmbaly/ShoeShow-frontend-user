import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductSseService {
  private eventSource: EventSource | null = null;
  private newProductSubject = new Subject<Product>();

  constructor(private zone: NgZone) { }

  connect(): void {
    if (!this.eventSource) {
      this.eventSource = new EventSource(`${environment.apiUrl}/api/products/stream`);

      this.eventSource.addEventListener('new-product', (event: MessageEvent) => {
        const rawProduct = JSON.parse(event.data);
        // Ensure img is always an array
        const product: Product = {
          ...rawProduct,
          img: typeof rawProduct.img === 'string' ? [rawProduct.img] : rawProduct.img
        };

        // Use NgZone to ensure Angular's change detection catches the update
        this.zone.run(() => {
          console.log('Received new product:', product);
          this.newProductSubject.next(product);
        });
      });

      this.eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        this.disconnect();
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.connect(), 5000);
      };
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  onNewProduct(): Observable<Product> {
    return this.newProductSubject.asObservable();
  }
}
