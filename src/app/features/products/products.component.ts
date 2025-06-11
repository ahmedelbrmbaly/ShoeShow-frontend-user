import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate, state, query, stagger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
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
import { ProductSseService } from '../../core/services/product-sse.service';

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
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
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
    private productSseService: ProductSseService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Force pageSize to exactly 12 when component initializes
    this.pageSize = 12;
    console.log('Component initialized with pageSize:', this.pageSize);

    // Read filter parameters from URL query params
    this.route.queryParams.subscribe(params => {
      const filters: ProductFilters = {};

      // Extract all possible filter parameters from URL
      if (params['category']) {
        filters.category = params['category'];
      }
      if (params['gender']) {
        filters.gender = params['gender'];
      }
      if (params['brand']) {
        // Handle both single value and array
        filters.brand = Array.isArray(params['brand']) ? params['brand'] : [params['brand']];
      }
      if (params['size']) {
        // Handle both single value and array
        filters.size = Array.isArray(params['size']) ? params['size'] : [params['size']];
      }
      if (params['color']) {
        // Handle both single value and array
        filters.color = Array.isArray(params['color']) ? params['color'] : [params['color']];
      }
      if (params['orderBy']) {
        filters.orderBy = params['orderBy'];
      }
      if (params['keyWord']) {
        filters.keyWord = params['keyWord'];
      }

      // Apply filters and update the filter component
      if (Object.keys(filters).length > 0) {
        this.currentFilters = filters;
      }

      this.loadProducts();
    });

    // Connect to SSE and listen for new products
    this.productSseService.connect();
    this.productSseService.onNewProduct().subscribe(rawProduct => {
      // Only add the new product if we're on the first page and there are no filters
      if (this.currentPage === 0 && Object.keys(this.currentFilters).length === 0) {
        // Add isNew flag to the product
        const productWithNewFlag = {
          ...rawProduct,
          isNew: true
        };
        // Add the new product at the beginning of the array
        this.products = [productWithNewFlag, ...this.products];
        // Remove the last product if we've exceeded pageSize
        if (this.products.length > this.pageSize) {
          this.products.pop();
        }
        this.totalProducts++;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this.productSseService.disconnect();
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

    // Update URL query parameters to match the current filters
    this.updateUrlQueryParams();

    this.loadProducts();

    // Close mobile filters if they're open
    if (this.isMobile && this.showMobileFilters) {
      this.showMobileFilters = false;
    }
  }

  private updateUrlQueryParams(): void {
    const queryParams: any = {};

    // Only add filters to queryParams if they are set (ignore UI-only values for enums)
    if (this.currentFilters.category) {
      queryParams.category = this.currentFilters.category;
    }
    if (this.currentFilters.gender) {
      queryParams.gender = this.currentFilters.gender;
    }
    if (this.currentFilters.brand && this.currentFilters.brand.length) {
      queryParams.brand = this.currentFilters.brand;
    }
    if (this.currentFilters.size && this.currentFilters.size.length) {
      queryParams.size = this.currentFilters.size;
    }
    if (this.currentFilters.color && this.currentFilters.color.length) {
      queryParams.color = this.currentFilters.color;
    }
    if (this.currentFilters.orderBy) {
      queryParams.orderBy = this.currentFilters.orderBy;
    }
    if (this.currentFilters.keyWord && this.currentFilters.keyWord.trim() !== '') {
      queryParams.keyWord = this.currentFilters.keyWord;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: '',
    });
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
