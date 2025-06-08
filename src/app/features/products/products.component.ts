import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { trigger, transition, style, animate, state, query, stagger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../core/services/product.service';
import { Product, ProductFilters } from '../../core/models/product.model';
import { ProductFiltersComponent } from './product-filters/product-filters.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss', './products.component.css'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('{{delay}}ms ease',
          style({ opacity: 1, transform: 'translateY(0)' })
        )
      ])
    ])
  ],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ProductFiltersComponent
  ]
})
export class ProductsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  products: Product[] = [];
  totalProducts = 0;
  pageSize = 12; // Changed to match service default
  currentPage = 0;
  loading = true;
  error = '';
  currentFilters: ProductFilters = {};
  isMobile = window.innerWidth < 768;
  showMobileFilters = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.showMobileFilters = false;
    }
  }

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Force pageSize to exactly 12 when component initializes
    this.pageSize = 12;
    console.log('Component initialized with pageSize:', this.pageSize);
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    // Ensure paginator is synced with component state
    if (this.paginator) {
      console.log('Paginator initialized with pageSize:', this.paginator.pageSize);
      // If paginator was initialized with different pageSize, sync it
      if (this.paginator.pageSize !== this.pageSize) {
        this.paginator.pageSize = this.pageSize;
        // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.loadProducts();
        });
      }
    }

    // Add a secondary check after Angular's view initialization is complete
    setTimeout(() => {
      const visibleProductCount = document.querySelectorAll('.product-card').length;
      console.log(`Visible product count in DOM: ${visibleProductCount}`);

      if (visibleProductCount !== this.products.length) {
        console.warn(`DOM shows ${visibleProductCount} products but data has ${this.products.length}`);
        // Force change detection
        this.cdr.detectChanges();
      }
    }, 500);
  }

  onFiltersChange(filters: ProductFilters): void {
    this.currentFilters = { ...filters };
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadProducts();

    // Close mobile filters if they're open
    if (this.isMobile && this.showMobileFilters) {
      this.showMobileFilters = false;
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  toggleFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  protected loadProducts(): void {
    this.loading = true;
    // Ensure we're explicitly using our component's pageSize value
    const requestPageSize = this.pageSize;
    this.productService.getProducts({
      ...this.currentFilters,
      pageNumber: this.currentPage,
      pageSize: requestPageSize
    }).subscribe({
      next: (response) => {
        this.loading = false;

        // First clear products to trigger new animations
        this.products = [];

        // Enhanced logging for debugging
        console.log(`Loaded ${response.data.length} products out of ${requestPageSize} requested`);
        console.log('Response data:', response);
        console.log('Current filters:', this.currentFilters);

        // Set product data after a minimal delay to ensure animations trigger
        setTimeout(() => {
          this.products = response.data;
          this.totalProducts = response.totalElements;
          this.cdr.detectChanges();
        }, 50);
      },
      error: (error) => {
        this.error = 'Failed to load products. Please try again later.';
        this.loading = false;
      }
    });
  }


  getImageUrl(imagePath: string): string {
    return `${environment.imageBaseUrl}/${imagePath}`;
  }
}
