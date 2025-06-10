import { Directive, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ViewportScroller } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appScrollToTop]',
  standalone: true
})
export class ScrollToTopDirective implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;

  constructor(
    private router: Router,
    private viewportScroller: ViewportScroller,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.subscription = this.router.events.pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd)
      ).subscribe(() => {
        // First immediate scroll attempt
        window.scrollTo(0, 0);
        this.viewportScroller.scrollToPosition([0, 0]);

        // Second attempt after a very short delay to catch Angular's rendering
        setTimeout(() => {
          window.scrollTo(0, 0);
          this.viewportScroller.scrollToPosition([0, 0]);

          // Final attempt after components are fully rendered
          setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }, 100);
        }, 0);
      });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
