import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
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
  styleUrls: ['./products.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    ProductFiltersComponent
  ]
})
export class ProductsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('drawer') drawer!: MatDrawer;

  products: Product[] = [];
  totalProducts = 0;
  pageSize = 10;
  currentPage = 0;
  loading = true;
  error = '';
  currentFilters: ProductFilters = {};
  isMobile = window.innerWidth < 768;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  onFiltersChange(filters: ProductFilters): void {
    this.currentFilters = { ...filters };
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadProducts();
    if (this.isMobile && this.drawer) {
      this.drawer.close();
    }
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  protected loadProducts(): void {
    this.loading = true;
    this.productService.getProducts({
      ...this.currentFilters,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    }).subscribe({
      next: (response) => {
        this.products = response.data;
        this.totalProducts = response.totalElements;
        this.loading = false;
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
