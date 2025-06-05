// product-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {ProductService} from '../../services/product.service';
import {Product} from '../../models/product';
import {CartService} from '../../services/cart.service';
import {CartItem} from '../../models/cartItem';


@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  standalone:false
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  quantity: number = 1;

  constructor(private _route: ActivatedRoute, private _productService: ProductService, private _cartService: CartService) {}

  ngOnInit(): void {
    const id = +this._route.snapshot.paramMap.get('id')!;
    this._productService.getProductById(id).subscribe(data => {
      this.product = data;
      console.log(this.product);
      this.isLoading = false;
    });
  }

  addToCart() {
    if(!this.product)
      return;
    const cartItem: CartItem = new CartItem(
      this.product!.id,
      this.product!.title,
      this.product!.price,
      this.quantity,
      this.product!.images[0]
    );
    this._cartService.addToCart(cartItem);
  }

  decrementQuantity() {
    if(this.quantity > 1)
      this.quantity--;
  }

  incrementQuantity() {
    if(this.quantity < this.product?.stock!)
    this.quantity++;
  }
}
