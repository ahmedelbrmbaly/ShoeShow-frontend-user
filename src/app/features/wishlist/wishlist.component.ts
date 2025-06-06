import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { WishlistItem } from '../../core/models/product.model';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatIcon} from '@angular/material/icon';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  imports: [
    MatProgressSpinner,
    MatIcon,
    MatCardActions,
    MatCard,
    MatCardContent
  ],
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  wishlistItems: WishlistItem[] = [];
  loading = true;
  error = '';

  constructor(
    private wishlistService: WishlistService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadWishlist();
  }

  protected loadWishlist(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.loading = true;
    this.wishlistService.getWishlist(userId).subscribe({
      next: (items) => {
        this.wishlistItems = items;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load wishlist items. Please try again later.';
        this.loading = false;
      }
    });
  }

  removeFromWishlist(productId: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.wishlistService.removeFromWishlist(userId, productId).subscribe({
      next: () => {
        this.wishlistItems = this.wishlistItems.filter(item => item.productId !== productId);
        this.snackBar.open('Item removed from wishlist', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to remove item. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  moveToCart(item: WishlistItem): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    // First, navigate to product details to select size and color
    this.router.navigate(['/products', item.productId]);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  getImageUrl(imagePath: string): string {
    return `${environment.imageBaseUrl}/${imagePath}`;
  }
}
