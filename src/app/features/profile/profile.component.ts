import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading = true;
  error = '';
  profileForm: FormGroup;
  isEditing = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('^\\+?[0-9]{10,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      birthdate: ['', Validators.required],
      job: ['', Validators.required],
      interests: [''],
      addresses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  protected loadUserProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.loading = true;
    this.authService.getUserProfile(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          name: user.name,
          phoneNumber: user.phoneNumber,
          email: user.email,
          birthdate: new Date(user.birthdate),
          job: user.job,
          interests: user.interests
        });
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.user) {
      const userId = this.authService.getCurrentUserId();
      if (!userId) return;

      const updatedProfile = {
        ...this.user,
        ...this.profileForm.value,
        userId
      };

      this.authService.updateUserProfile(userId, updatedProfile).subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.isEditing = false;
        },
        error: (error) => {
          this.snackBar.open('Failed to update profile. Please try again.', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile();
    }
  }
}
