
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class AboutComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize any external libraries or settings here
    this.initAnimationsOnScroll();
  }

  private initAnimationsOnScroll(): void {
    // This method would typically initialize a scroll animation library like AOS
    // Since we're not directly importing the library, we're keeping this as a placeholder
    // In a real app, you would add the AOS initialization code here
    console.log('Animation on scroll initialized');

    // Typically would look like:
    // AOS.init({
    //   duration: 800,
    //   easing: 'ease-in-out',
    //   once: true
    // });
  }

  // Any additional component methods would go here
}
