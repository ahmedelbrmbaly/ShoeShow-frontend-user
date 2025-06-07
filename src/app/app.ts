import {Component, OnInit, HostListener, PLATFORM_ID, Inject} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { WishlistService } from './core/services/wishlist.service';
import { FooterComponent } from './core/components/footer/footer.component';
import {FormsModule} from '@angular/forms';
import {MatBadge} from '@angular/material/badge';
import {MatLine} from '@angular/material/core';
import {User} from './core/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatDividerModule,
    MatListModule,
    FooterComponent,
    FormsModule,
    MatBadge,
    MatLine,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
  export class AppComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  cartCount: number = 0;
  wishlistCount: number = 0;
  notificationCount: number = 0;
  currentUser: User | undefined;
  headerScrolled: boolean = false;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isAuthenticated$ = this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }

  ngOnInit(): void {
    // Initialize required data
    this.checkScrollPosition();
    this.loadUserData();

    // Set up periodic refresh of cart and wishlist data (every 5 minutes)
    if (isPlatformBrowser(this.platformId)) {
      setInterval(() => {
        const userId = this.authService.getCurrentUserId();
        if (userId) {
          this.fetchCartData(userId);
          this.fetchWishlistData(userId);
        }
      }, 500000); // 5 minutes in milliseconds
    }
  }

  private loadUserData(): void {
    // Subscribe to the user data from auth service
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user || undefined;

      if (user) {
        // Here you would typically fetch additional user data like cart, wishlist, notifications
        this.fetchCartData(user.userId);
        this.fetchWishlistData(user.userId);
      } else {
        // Reset counts when user logs out
        this.cartCount = 0;
        this.wishlistCount = 0;
        this.notificationCount = 0;
      }
    });
  }

  @HostListener('window:scroll')
  checkScrollPosition() {
    if (isPlatformBrowser(this.platformId)) {
      this.headerScrolled = window.scrollY > 30;
    }
  }

  // Fetch cart data for the user
  private fetchCartData(userId: number): void {
    this.cartService.getCart(userId).subscribe({
      next: (items) => {
        this.cartCount = items.length;
      },
      error: (error) => {
        console.error('Error fetching cart data:', error);
        this.cartCount = 0;
      }
    });
  }

  // Fetch wishlist data for the user
  private fetchWishlistData(userId: number): void {
    this.wishlistService.getWishlist(userId).subscribe({
      next: (items) => {
        this.wishlistCount = items.length;
      },
      error: (error) => {
        console.error('Error fetching wishlist data:', error);
        this.wishlistCount = 0;
      }
    });
  }



  // Method to manually refresh user data
  refreshUserData(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      // Fetch user profile data
      this.authService.getUserProfile(userId).subscribe({
        next: (user) => {
          // The user data is already updated in the service
          this.currentUser = user;

          // Refresh cart and wishlist data
          this.fetchCartData(userId);
          this.fetchWishlistData(userId);
        },
        error: (error) => {
          console.error('Error refreshing user profile:', error);
        }
      });
    }
  }

  // Get user initials for avatar display
  getInitials(name: string | undefined): string {
    if (!name) return '';

    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return name.charAt(0).toUpperCase();
    }

    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']).then(r => true);
  }
}
