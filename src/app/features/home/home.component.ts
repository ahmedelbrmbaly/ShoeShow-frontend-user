import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class HomeComponent implements OnInit {
  bestSellers: Product[] = [];
  loading = false;
  error = '';
  email = '';

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBestSellers();
  }

  loadBestSellers(): void {
    this.loading = true;
    this.error = '';
    this.productService.getBestSellers().subscribe({
      next: (response) => {
        this.bestSellers = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load best sellers. Please try again.';
        this.loading = false;
      }
    });
  }

  getImageUrl(imagePath: string): string {
    return `http://localhost:8081/${imagePath}`;
  }

  onSubscribe(): void {
    if (!this.email) return;

    // Simulated newsletter subscription
    this.snackBar.open('Thank you for subscribing to our newsletter!', 'Close', {
      duration: 3000
    });
    this.email = '';
  }
}
