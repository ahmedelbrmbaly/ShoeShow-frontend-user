import { Pipe, PipeTransform } from '@angular/core';
import {Product} from '../models/product';

@Pipe({
  name: 'productFilter',
  standalone: false
})
export class ProductFilterPipe implements PipeTransform {

  transform(
    products: Product[],
    title: string = '',
    maxPrice: number = Infinity,
    category: string = ''
  ): Product[] {
    if (!products) return [];

    return products.filter(product =>
      (title.trim() == '' || product.title.toLowerCase().includes(title.toLowerCase())) &&
      (!maxPrice || product.price <= maxPrice) &&
      (!category || product.category === category)
    );
  }

}
