import {Injectable} from '@angular/core';
import {CartItem} from '../models/cartItem';


@Injectable({
  providedIn: 'root'
})

export class CartService {

  private cartKey:string = 'cart';

  getCartItems(): CartItem[] {
    const items = localStorage.getItem(this.cartKey);
    return items ? JSON.parse(items) : [];
  }

  saveCartItems(items: CartItem[]): void {
    localStorage.setItem(this.cartKey, JSON.stringify(items));
  }

  addToCart(newItem: CartItem): void {
    const cart = this.getCartItems();
    const existing = cart.find(item => item.id === newItem.id);

    if (existing) {
      existing.quantity = newItem.quantity;
    } else {
      cart.push(newItem);
    }

    this.saveCartItems(cart);
  }

  clearCart(): void {
    localStorage.removeItem(this.cartKey);
  }
}
