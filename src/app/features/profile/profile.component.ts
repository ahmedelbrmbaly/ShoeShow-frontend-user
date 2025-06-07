import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
import { User, Address } from '../../core/models/user.model';
import { MatCheckbox } from '@angular/material/checkbox';

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
    MatIconModule,
    MatCheckbox
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
      addresses: this.fb.array([]),
      creditLimit: ['', Validators.min(0)]
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
          interests: user.interests,
          creditLimit: user.creditLimit
        });
        this.setAddresses(user.addresses);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load profile. Please try again later.';
        this.loading = false;
      }
    });
  }

  private setAddresses(addresses: Address[]): void {
    const addressFormArray = this.profileForm.get('addresses') as FormArray;
    addressFormArray.clear();
    addresses.forEach(address => {
      addressFormArray.push(this.fb.group({
        addressId: [address.addressId],
        street: [address.street, Validators.required],
        buildingNumber: [address.buildingNumber, [Validators.required, Validators.pattern('^[0-9]+$')]],
        state: [address.state, Validators.required],
        isDefault: [address.isDefault]
      }));
    });
  }

  get addresses(): FormArray {
    return this.profileForm.get('addresses') as FormArray;
  }

  addAddress(): void {
    this.addresses.push(this.fb.group({
      street: ['', Validators.required],
      buildingNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      state: ['', Validators.required],
      isDefault: [false]
    }));
  }

  removeAddress(index: number): void {
    const isDefault = this.addresses.at(index).get('isDefault')?.value;
    if (isDefault) {
      this.snackBar.open('Cannot remove default address. Please select another default address first.', 'Close', {
        duration: 3000
      });
      return;
    }
    this.addresses.removeAt(index);
  }

  onDefaultAddressSelected(index: number): void {
    this.addresses.controls.forEach((group, i) => {
      const control = group.get('isDefault');
      if (i === index) {
        control?.setValue(true);
      } else {
        control?.setValue(false);
      }
    });
  }

  onSubmit(): void {
    if (!this.profileForm.valid || !this.user) return;

    const hasDefault = this.addresses.controls.some(addr => addr.get('isDefault')?.value);
    if (!hasDefault) {
      this.snackBar.open('Please select a default address.', 'Close', { duration: 3000 });
      return;
    }

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
      error: () => {
        this.snackBar.open('Failed to update profile. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserProfile();
    }
  }

  get addressControls(): FormArray {
    return this.profileForm.get('addresses') as FormArray;
  }
}
