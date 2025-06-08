import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem } from '../../core/models/product.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  loading = true;
  error = '';
  displayedColumns: string[] = ['image', 'name', 'size', 'color', 'price', 'quantity', 'total', 'actions'];

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  protected loadCart(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.loading = true;
    this.cartService.getCart(userId).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load cart items. Please try again later.';
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    this.cartService.updateCartItem(userId, {
      productId: item.productId,
      productInfoId: item.productInfoId,
      quantity: newQuantity
    }).subscribe({
      next: () => {
        item.quantity = newQuantity;

        // We don't need to update cart count here as the number of items remains the same
        // Only the quantity of an existing item changes

        this.snackBar.open('Cart updated successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        if(error.error.message === 'Out of stock') {
          this.snackBar.open('Item is out of stock. Please reduce quantity.', 'Close', { duration: 3000 });
          return;
        }
        this.snackBar.open('Failed to update cart. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  removeItem(item: CartItem): void {
    console.log(item);
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.cartService.removeFromCart(userId, item.itemId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(i => i.itemId !== item.itemId);

        // Update app component's cart count
        const appComponent = (window as any).appComponent;
        if (appComponent) {
          appComponent.fetchCartData(userId);
        }

        this.snackBar.open('Item removed from cart', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Failed to remove item. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  checkout(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.cartService.placeOrder(userId).subscribe({
      next: () => {
        // Update app component's cart count (should be 0 after checkout)
        const appComponent = (window as any).appComponent;
        if (appComponent) {
          appComponent.fetchCartData(userId);
        }

        this.snackBar.open('Order placed successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/orders']);
      },
      error: (error) => {
        this.snackBar.open(error.error.message, 'Close', { duration: 3000 });
      }
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  getImageUrl(imagePath: string): string {
    return `${environment.imageBaseUrl}/${imagePath}`;
  }
}

