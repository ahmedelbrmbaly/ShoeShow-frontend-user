import {Component, OnInit} from '@angular/core';
import {CartItem} from '../../models/cartItem';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  toastMessage: string | null = null;

  ngOnInit() {
    const storedCart = localStorage.getItem('cart');
    this.cartItems = storedCart ? JSON.parse(storedCart) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  removeItem(item: CartItem) {
    this.cartItems = this.cartItems.filter(i => i.id !== item.id);
    this.saveCart();
    this.toastMessage = `"${item.title}" has been removed from your cart.`;
  }

  increaseQuantity(item: CartItem) {
    item.quantity++;
    this.saveCart();
  }

  decreaseQuantity(item: CartItem) {
    if (item.quantity > 1) {
      item.quantity--;
      this.saveCart();
    }
  }

  clearCart() {
    this.cartItems = [];
    this.saveCart();
    this.toastMessage = "Your cart has been cleared.";
  }

}
