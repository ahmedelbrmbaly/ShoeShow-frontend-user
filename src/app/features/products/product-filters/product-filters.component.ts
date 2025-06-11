import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProductFilters } from '../../../core/models/product.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelect } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import { MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-product-filters',
  templateUrl: './product-filters.component.html',
  styleUrls: ['./product-filters.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule,
    MatLabel
  ]
})
export class ProductFiltersComponent implements OnInit {
  @Input() currentFilters: ProductFilters = {};
  @Output() filtersChange = new EventEmitter<ProductFilters>();
  @Output() filtersClosed = new EventEmitter<void>();

  filterForm: FormGroup;

  readonly brands = ['Nike', 'Merrel', 'Adidas', 'Puma', 'Gucci', 'Sketchers', 'Reebok', 'New Balance'];
  readonly sizes = ['SIZE_35', 'SIZE_36', 'SIZE_37', 'SIZE_38', 'SIZE_39', 'SIZE_40', 'SIZE_41', 'SIZE_42', 'SIZE_43', 'SIZE_44', 'SIZE_45', 'SIZE_46', 'SIZE_47', 'SIZE_48'];
  readonly colors = ['Black', 'White', 'Blue', 'Grey', 'Brown', 'Red', 'Cream'];
  readonly genders = ['MALE', 'FEMALE'];
  readonly categories = ['SNEAKERS', 'CLASSIC', 'CASUAL'];
  readonly sortOptions = [
    { value: 'newArrival', label: 'New Arrivals' },
    { value: 'bestseller', label: 'Best Sellers' }
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      brand: [[]],
      size: [[]],
      color: [[]],
      orderBy: [''],
      gender: [''],
      category: [''],
      keyWord: ['']
    });
  }

  ngOnInit(): void {
    // Initialize form with current filters
    this.filterForm.patchValue(this.currentFilters);

    // Listen to form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(filters => {
        // Remove empty values
        const cleanFilters = Object.entries(filters)
          .reduce((acc, [key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              // @ts-ignore
              acc[key as keyof ProductFilters] = value;
            } else if (typeof value === 'string' && value.trim() !== '') {
              // @ts-ignore
              acc[key as keyof ProductFilters] = value;
            }
            return acc;
          }, {} as ProductFilters);

        this.filtersChange.emit(cleanFilters);
      });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  closeFilters(): void {
    this.filtersClosed.emit();
  }

  onSelectChange(select: MatSelect): void {
    // Close the dropdown after selection
    select.close();
  }
}
