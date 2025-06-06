import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../../environments/environment';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, ProductInfo } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ]
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  error = '';
  selectedImage = 0;
  addToCartForm: FormGroup;
  availableColors: string[] = [];
  availableSizes: string[] = [];
  selectedProductInfo: ProductInfo | null = null;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.addToCartForm = this.fb.group({
      color: ['', Validators.required],
      size: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.router.navigate(['/products']);
    }

    // Update available sizes when color changes
    this.addToCartForm.get('color')?.valueChanges.subscribe(color => {
      this.updateAvailableSizes(color);
      this.addToCartForm.patchValue({ size: '' });
      this.selectedProductInfo = null;
    });

    // Update selected ProductInfo when both color and size are selected
    this.addToCartForm.valueChanges.subscribe(() => {
      this.updateSelectedProductInfo();
    });
  }

  public loadProduct(id: number): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        // Extract unique colors and ensure they're in stock
        this.availableColors = [...new Set(
          product.productInfos
            .filter(info => info.quantity > 0)
            .map(info => info.color)
        )];
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load product details. Please try again later.';
        this.loading = false;
      }
    });
  }

  private updateAvailableSizes(color: string): void {
    if (!this.product) return;
    this.availableSizes = this.product.productInfos
      .filter(info => info.color === color && info.quantity > 0)
      .map(info => info.size);
  }

  private updateSelectedProductInfo(): void {
    if (!this.product) return;
    const { color, size } = this.addToCartForm.value;
    if (color && size) {
      this.selectedProductInfo = this.product.productInfos.find(
        info => info.color === color && info.size === size
      ) || null;

      // Update max quantity based on stock
      if (this.selectedProductInfo) {
        const currentQty = this.addToCartForm.get('quantity')?.value || 1;
        if (currentQty > this.selectedProductInfo.quantity) {
          this.addToCartForm.patchValue({
            quantity: Math.min(currentQty, this.selectedProductInfo.quantity)
          });
        }
      }
    } else {
      this.selectedProductInfo = null;
    }
  }

  getImageUrl(imagePath: string): string {
    return `${environment.imageBaseUrl}/${imagePath}`;
  }

  getStockStatus(quantity: number): string {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 5) return `Low Stock - Only ${quantity} left`;
    return `${quantity} items available`;
  }

  onImageSelect(index: number): void {
    this.selectedImage = index;
  }

  addToCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to add items to cart', 'Login', {
        duration: 3000
      }).onAction().subscribe(() => {
        this.router.navigate(['/auth/login']);
      });
      return;
    }

    if (this.addToCartForm.valid && this.product && this.selectedProductInfo) {
      const userId = this.authService.getCurrentUserId();
      if (!userId) return;

      this.submitting = true;
      this.cartService.addToCart(userId, {
        productId: this.product.productId,
        productInfoId: this.selectedProductInfo.productInfoId,
        quantity: this.addToCartForm.value.quantity
      }).subscribe({
        next: () => {
          this.snackBar.open('Added to cart successfully', 'View Cart', {
            duration: 3000
          }).onAction().subscribe(() => {
            this.router.navigate(['/cart']);
          });
          this.submitting = false;
        },
        error: () => {
          this.snackBar.open('Failed to add to cart. Please try again.', 'Close', {
            duration: 3000
          });
          this.submitting = false;
        }
      });
    }
  }

  addToWishlist(): void {
    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please login to add items to wishlist', 'Login', {
        duration: 3000
      }).onAction().subscribe(() => {
        this.router.navigate(['/auth/login']);
      });
      return;
    }

    if (this.product) {
      const userId = this.authService.getCurrentUserId();
      if (!userId) return;

      this.submitting = true;
      this.wishlistService.addToWishlist(userId, [this.product.productId]).subscribe({
        next: () => {
          this.snackBar.open('Added to wishlist successfully', 'View Wishlist', {
            duration: 3000
          }).onAction().subscribe(() => {
            this.router.navigate(['/wishlist']);
          });
          this.submitting = false;
        },
        error: () => {
          this.snackBar.open('Failed to add to wishlist. Please try again.', 'Close', {
            duration: 3000
          });
          this.submitting = false;
        }
      });
    }
  }

  getDisplaySize(size: string): string {
    return size.replace('SIZE_', '');
  }
}
