import {Component} from '@angular/core';
import {ProductService} from '../../services/product.service';
import {Product} from '../../models/product';
import {trigger, transition, query, style, stagger, animate} from '@angular/animations';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({opacity: 0, transform: 'translateY(20px)'}),
          stagger(100, [
            animate('300ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
          ])
        ], {optional: true})
      ])
    ])
  ]
})
export class ProductsComponent {
  products: Product[] = [];
  categories: string[] = [];

  filterTitle: string = '';
  filterPrice: number = Infinity;
  filterCategory: string | undefined;

  isLoading: boolean = true;

  constructor(private _productService: ProductService) {
  }

  ngOnInit(): void {
    this._productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
        console.log(this.products);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to fetch products', err);
      }
    });
    this._productService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        console.log(this.categories);
      },
      error: (err) => console.log("error on fetching categories", err)
    })
  }


  imageLoaded: { [productId: number]: boolean } = {};

  onImageLoad(productId: number) {
    this.imageLoaded[productId] = true;
  }

  resetFilters(): void {
    this.filterTitle = '';
    this.filterPrice = Infinity;
    this.filterCategory = undefined;
  }

  protected readonly Math = Math;
}
