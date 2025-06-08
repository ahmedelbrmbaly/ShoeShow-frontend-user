/**
 * Shared animation utilities for the application
 */
export class AnimationUtils {
  /**
   * Refreshes AOS animations if available
   */
  static refreshAnimations(): void {
    // Wait for DOM to update
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).AOS) {
        (window as any).AOS.refresh();
      }
    }, 100);
  }

  /**
   * Hard refresh of AOS animations - destroy and reinitialize
   */
  static refreshHard(): void {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      const aos = (window as any).AOS;

      // Add refreshHard method to AOS if it doesn't exist
      if (typeof aos.refreshHard !== 'function') {
        aos.refreshHard = function() {
          // Store current configuration
          const config = this.options || {
            duration: 800,
            easing: 'ease-in-out',
            once: false,
            startEvent: 'DOMContentLoaded'
          };

          // Get all elements with data-aos attributes
          document.querySelectorAll('[data-aos]').forEach(el => {
            el.classList.remove('aos-animate');
          });

          // Force reflow
          window.dispatchEvent(new Event('resize'));

          // Reinitialize
          this.init(config);
          this.refresh(true);
        };
      }

      // Call the refreshHard method
      aos.refreshHard();
    }
  }

  /**
   * Initialize AOS with custom settings
   */
  static initAnimations(options: any = {}): void {
    if (typeof window !== 'undefined' && (window as any).AOS) {
      (window as any).AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100,
        ...options
      });
    }
  }
}
