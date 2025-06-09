import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { ChatService, ChatMessage, ProductSuggestion } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { OrderService } from '../../core/services/order.service';
import { environment } from '../../../environments/environment';
import { ProductFilters } from '../../core/models/product.model';

interface DisplayMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  products?: ProductSuggestion[];
  wishlistItems?: any[]; // Add wishlist items to display
  featuredProduct?: ProductSuggestion; // Add detailed product info for featured product
  isLoading?: boolean;
  error?: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: false
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private messagesContainer!: ElementRef;

  messages: DisplayMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isChatOpen: boolean = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private cartService: CartService,
    private orderService: OrderService,
    private wishlistService: WishlistService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialize chat with a greeting message
    setTimeout(() => {
      this.messages.push({
        role: 'assistant',
        content: 'Hi there! 👋 I\'m ShoeBot, your shoe shopping assistant. How can I help you today?',
        timestamp: new Date()
      });
    }, 500);
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Sends user message and processes AI response
   */
  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    const userMessage = this.newMessage.trim();
    this.newMessage = '';

    // Add user message to chat
    this.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });

    // Add temporary loading message
    this.messages.push({
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    });
    this.isLoading = true;

    // Process message and check for special requests
    this.processUserMessage(userMessage);
  }

  /**
   * Processes user message and determines appropriate action
   * @param message The user's message
   */
  private processUserMessage(message: string): void {
    const lowerMessage = message.toLowerCase();
    console.log('Processing message:', lowerMessage);

    // Check if user is asking for orders
    if (lowerMessage.includes('order')) {
      const orderNumber = this.chatService.extractOrderNumber(message);

      if (this.authService.isAuthenticated()) {
        if (orderNumber) {
          this.handleSpecificOrder(orderNumber);
        } else {
          this.handleRecentOrders();
        }
      } else {
        this.promptForLogin('see your orders');
        return;
      }
    }
    // Check if user is asking to view their wishlist - Improved recognition patterns
    else if ((lowerMessage.includes('wishlist') &&
          (lowerMessage.includes('my') ||
           lowerMessage.includes('view') ||
           lowerMessage.includes('show') ||
           lowerMessage.includes('see') ||
           lowerMessage.includes('current'))) ||
           lowerMessage === 'view it' ||
           lowerMessage === 'view wishlist' ||
           lowerMessage === 'show wishlist' ||
           lowerMessage === 'my wishlist') {
      console.log('Wishlist view command detected');
      if (this.authService.isAuthenticated()) {
        this.handleViewWishlist();
      } else {
        this.promptForLogin('view your wishlist');
        return;
      }
    }
    // Check if user wants to add to wishlist - Improved detection for "add to it" commands
    else if ((lowerMessage.includes('add') || lowerMessage.includes('save')) &&
          ((lowerMessage.includes('wishlist') || lowerMessage.includes('to it')) &&
           lowerMessage.includes('product'))) {
      console.log('Add to wishlist command detected');
      // Extract product ID
      const productId = this.extractProductId(message);

      if (productId) {
        if (this.authService.isAuthenticated()) {
          console.log('Adding product to wishlist:', productId);
          this.handleAddToWishlistDirectly(productId);
        } else {
          this.promptForLogin('add items to your wishlist');
        }
      } else {
        this.sendToGroqAPI("I'd be happy to add a product to your wishlist. Could you please specify which product you'd like to add? Please mention the product number (e.g., 'add product #5 to wishlist').");
      }
      return;
    }
    // Check if user is asking to remove from wishlist
    else if ((lowerMessage.includes('remove') || lowerMessage.includes('delete')) &&
             lowerMessage.includes('wishlist')) {
      if (this.authService.isAuthenticated()) {
        // Use improved product ID extraction
        const productId = this.chatService.extractProductId(message);

        if (productId) {
          this.handleRemoveFromWishlist(productId);
        } else {
          this.sendToGroqAPI("Could you please specify which product you'd like to remove from your wishlist? Please mention the product number, for example 'remove product #5 from wishlist'.");
        }
      } else {
        this.promptForLogin('manage your wishlist');
        return;
      }
    }
    // Check if user is looking for product recommendations
    else if (
      lowerMessage.includes('recommend') ||
      lowerMessage.includes('suggestion') ||
      lowerMessage.includes('looking for') ||
      lowerMessage.includes('find me') ||
      lowerMessage.includes('show me') ||
      lowerMessage.includes('need shoes') ||
      lowerMessage.includes('want shoes') ||
      (lowerMessage.includes('shoes') &&
        (lowerMessage.includes('good') ||
         lowerMessage.includes('best') ||
         lowerMessage.includes('like')))
    ) {
      this.getProductRecommendations(message);
    }
    // Check if user wants to add to cart
    else if ((lowerMessage.includes('cart') || lowerMessage.includes('buy')) &&
             lowerMessage.includes('product')) {
      // Use improved product ID extraction
      const productId = this.chatService.extractProductId(message);

      if (productId) {
        if (this.authService.isAuthenticated()) {
          // First verify the product exists in our catalog
          this.chatService.getProductById(productId).subscribe({
            next: (product) => {
              if (product) {
                // Instead of just sending a message, provide a way to navigate to the product
                this.replaceLoadingMessage({
                  role: 'assistant',
                  content: `I found ${product.name} (Product #${productId})! To add it to your cart, you'll need to select a size and color. Would you like to view this product?`,
                  timestamp: new Date(),
                  products: [{
                    productId: product.productId,
                    name: product.name,
                    price: product.price,
                    image: product.img[0]
                  }]
                });
              } else {
                this.sendToGroqAPI(`I couldn't find Product #${productId} in our store. Could you please check the product number and try again?`);
              }
            },
            error: () => {
              this.sendToGroqAPI(`I'm having trouble verifying Product #${productId}. Please try again later or browse our products section.`);
            }
          });
        } else {
          this.promptForLogin('add items to your cart');
        }
      } else {
        this.sendToGroqAPI("I'd be happy to help you add an item to your cart. Could you please specify which product you're interested in? Please mention the product number (e.g., 'add product #5 to cart').");
      }
    }
    // Check if user wants to checkout
    else if (lowerMessage.includes('checkout') ||
             lowerMessage.includes('place order') ||
             (lowerMessage.includes('buy') && lowerMessage.includes('now')) ||
             (lowerMessage.includes('complete') && lowerMessage.includes('purchase'))) {
      if (!this.authService.isAuthenticated()) {
        this.promptForLogin('checkout');
        return;
      }
      this.handleCheckout();
    }
    // NEW: Check if user is expressing interest in a specific product number
    else if (lowerMessage.match(/product\s*(?:#|number|num|no\.?|id)?\s*\d+|#\d+/i) &&
            (lowerMessage.includes('looks great') ||
             lowerMessage.includes('interested') ||
             lowerMessage.includes('tell me more') ||
             lowerMessage.includes('more about') ||
             lowerMessage.includes('like product') ||
             lowerMessage.includes('show me product'))) {
      const productId = this.extractProductId(message);
      if (productId) {
        console.log('User showing interest in product:', productId);
        this.showDetailedProductInfo(productId);
      } else {
        this.sendToGroqAPI("I'd be happy to tell you more about a product. Could you please specify which product you're interested in by number?");
      }
    }
    // Check if user responded "yes" to login prompt
    else if (lowerMessage === 'yes' && this.messages.some(m =>
      m.role === 'assistant' &&
      m.content.includes("you'll need to log in") ||
      m.content.includes("Respond with \"Yes\""))) {
      this.router.navigate(['/auth/login']);
      this.replaceLoadingMessage({
        role: 'assistant',
        content: "I'm taking you to the login page now. Once you're logged in, you can come back here and we'll continue.",
        timestamp: new Date()
      });
    }
    // Default: send to Groq API
    else {
      this.sendToGroqAPI(message);
    }
  }

  /**
   * Sends message to Groq API and handles response
   * @param message User message to send
   */
  private sendToGroqAPI(message: string): void {
    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        // Check if the response contains product mentions like "#1", "#12", etc.
        const productIds = this.extractProductIdsFromText(response);

        if (productIds.length > 0) {
          // If there are product mentions, fetch those products and show them as cards
          this.fetchAndDisplayMentionedProducts(response, productIds);
        } else {
          // If no product mentions, just display the text response
          this.replaceLoadingMessage({
            role: 'assistant',
            content: response,
            timestamp: new Date()
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Chat API error:', error);
        this.replaceLoadingMessage({
          role: 'assistant',
          content: 'Sorry, I\'m having trouble connecting right now. Please try again later! 🙇‍♂️',
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Extract product IDs from a text response
   */
  private extractProductIdsFromText(text: string): number[] {
    // Look for patterns like "#1", "Product #5", "product 7", etc.
    const regex = /(?:product\s*(?:#|number|num|no\.?|id)?\s*(\d+)|#(\d+))/gi;
    const matches = [...text.matchAll(regex)];
    const productIds: number[] = [];

    matches.forEach(match => {
      const id = parseInt(match[1] || match[2], 10);
      if (!isNaN(id) && !productIds.includes(id)) {
        productIds.push(id);
      }
    });

    return productIds;
  }

  /**
   * Fetch product details for mentioned products and display them as cards
   */
  private fetchAndDisplayMentionedProducts(response: string, productIds: number[]): void {
    // Limit to first 3 products to avoid overwhelming the UI
    const idsToFetch = productIds.slice(0, 3);
    const productPromises = idsToFetch.map(id =>
      this.chatService.getProductById(id).toPromise()
    );

    Promise.all(productPromises)
      .then(products => {
        const validProducts = products.filter(p => p !== null && p !== undefined);

        // Convert products to ProductSuggestion format
        const productSuggestions: ProductSuggestion[] = validProducts.map(product => ({
          productId: product.productId,
          name: product.name,
          price: product.price,
          image: product.img[0]
        }));

        if (productSuggestions.length > 0) {
          // Display the response with product cards
          this.replaceLoadingMessage({
            role: 'assistant',
            content: response,
            timestamp: new Date(),
            products: productSuggestions
          });
        } else {
          // If no valid products were found, just show the text
          this.replaceLoadingMessage({
            role: 'assistant',
            content: response,
            timestamp: new Date()
          });
        }
      })
      .catch(error => {
        console.error('Error fetching product details:', error);
        // If there's an error fetching products, just show the text response
        this.replaceLoadingMessage({
          role: 'assistant',
          content: response,
          timestamp: new Date()
        });
      });
  }

  /**
   * Handles getting product recommendations based on user message
   * @param message User message containing product preferences
   */
  private getProductRecommendations(message: string): void {
    // Extract filters using the improved method in ChatService
    const filters = this.chatService.extractProductPreferences(message);

    // Send message to API first to get a conversational response
    this.chatService.sendMessage(message).subscribe({
      next: (response) => {
        // Get product recommendations based on extracted filters
        this.chatService.getProductRecommendations(filters).subscribe({
          next: (products) => {
            if (products && products.length > 0) {
              // Replace loading message with response and product suggestions
              this.replaceLoadingMessage({
                role: 'assistant',
                content: response,
                timestamp: new Date(),
                products: products
              });
            } else {
              // If no products match the filters, try with fewer filters
              const simplifiedFilters: ProductFilters = {};
              // Keep only gender and category if specified
              if (filters.gender) simplifiedFilters.gender = filters.gender;
              if (filters.category) simplifiedFilters.category = filters.category;

              this.chatService.getProductRecommendations(simplifiedFilters).subscribe({
                next: (fallbackProducts) => {
                  this.replaceLoadingMessage({
                    role: 'assistant',
                    content: response + (fallbackProducts.length === 0 ?
                      '\n\nI couldn\'t find exact matches for your preferences, but here are some popular shoes you might like:' :
                      ''),
                    timestamp: new Date(),
                    products: fallbackProducts
                  });
                },
                error: () => {
                  // If even the fallback fails, just show the response
                  this.replaceLoadingMessage({
                    role: 'assistant',
                    content: response,
                    timestamp: new Date()
                  });
                }
              });
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching product recommendations:', error);
            // Still show the AI response even if product fetch failed
            this.replaceLoadingMessage({
              role: 'assistant',
              content: response + '\n\nI tried to find some products for you, but encountered an issue. Please try again or browse our products section!',
              timestamp: new Date()
            });
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Chat API error:', error);
        this.replaceLoadingMessage({
          role: 'assistant',
          content: 'Sorry, I\'m having trouble with your request right now. Please try again later! 🙇‍♂️',
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles adding a product to the wishlist
   */
  private handleAddToWishlist(userId: number, productId: number, productName: string): void {
    this.wishlistService.addToWishlist(userId, [productId]).subscribe({
      next: (response) => {
        this.replaceLoadingMessage({
          role: 'assistant',
          content: `I've added product #${productId} (${productName}) to your wishlist! You can view your wishlist to see all saved items.`,
          timestamp: new Date()
        });

        // Update app component's wishlist count
        const appComponent = (window as any).appComponent;
        if (appComponent) {
          appComponent.fetchWishlistData(userId);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Wishlist error:', error);
        let errorMessage = 'Sorry, I couldn\'t add this item to your wishlist.';

        // Check if it's already in the wishlist
        if (error.status === 409 || (error.error && error.error.includes('already exists'))) {
          errorMessage = `Product #${productId} is already in your wishlist.`;
        } else if (error.status === 404) {
          errorMessage = `I couldn't find product #${productId} in our store.`;
        }

        this.replaceLoadingMessage({
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle removing an item from wishlist
   */
  handleRemoveFromWishlist(productId: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.wishlistService.removeFromWishlist(userId, productId).subscribe({
      next: () => {
        this.replaceLoadingMessage({
          role: 'assistant',
          content: `I've successfully removed product #${productId} from your wishlist.`,
          timestamp: new Date()
        });

        // Update app component's wishlist count
        const appComponent = (window as any).appComponent;
        if (appComponent) {
          appComponent.fetchWishlistData(userId);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error removing from wishlist:', error);
        let errorMessage = 'Sorry, I couldn\'t remove this item from your wishlist.';

        if (error.status === 404) {
          errorMessage = `Product #${productId} is not in your wishlist.`;
        }

        this.replaceLoadingMessage({
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Handles checkout flow
   */
  private handleCheckout(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.handleNotAuthenticated('checkout');
      return;
    }

    this.chatService.checkout(userId).subscribe({
      next: () => {
        this.replaceLoadingMessage({
          role: 'assistant',
          content: 'Great news! I\'ve successfully placed your order. You can track its status in the "Orders" section of your account. Thank you for shopping with ShoeShow! 🎉',
          timestamp: new Date()
        });
        this.isLoading = false;

        // Update app component's cart count to 0 after successful checkout
        const appComponent = (window as any).appComponent;
        if (appComponent) {
          appComponent.fetchCartData(userId);
        }
      },
      error: (error) => {
        console.error('Checkout error:', error);
        let errorMessage = 'Sorry, I encountered an issue while trying to process your checkout.';

        if (typeof error === 'string') {
          errorMessage += ` ${error}`;
        } else if (error.error?.message) {
          errorMessage += ` ${error.error.message}`;
        } else {
          errorMessage += ' Please try again or use the checkout button in your cart.';
        }

        this.replaceLoadingMessage({
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle not authenticated user
   * @param feature The feature requiring authentication
   */
  private handleNotAuthenticated(feature: string): void {
    this.promptForLogin(feature);
  }

  /**
   * Prompts the user to log in to access specific features
   * @param feature The feature requiring authentication
   */
  private promptForLogin(feature: string): void {
    this.replaceLoadingMessage({
      role: 'assistant',
      content: `You'll need to log in to ${feature}. Would you like to go to the login page now?`,
      timestamp: new Date()
    });
    this.isLoading = false;

    // Add additional "Yes" message after a short delay to guide user
    setTimeout(() => {
      this.messages.push({
        role: 'assistant',
        content: 'Respond with "Yes" if you\'d like me to take you to the login page.',
        timestamp: new Date()
      });
    }, 1000);
  }

  /**
   * Navigate to product details
   * @param productId The product ID to navigate to
   */
  navigateToProduct(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    if (this.newMessage.toLowerCase().includes('yes')) {
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Returns the image URL with proper base path
   * @param imagePath The relative image path
   * @returns Full image URL
   */
  getImageUrl(imagePath: string): string {
    return `${environment.imageBaseUrl}/${imagePath}`;
  }

  /**
   * Formats a date string for display
   * @param dateString The date string to format
   * @returns Formatted date string
   */
  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Replaces the loading message with actual content
   * @param message The message to display
   */
  private replaceLoadingMessage(message: DisplayMessage): void {
    const lastIndex = this.messages.length - 1;
    if (lastIndex >= 0 && this.messages[lastIndex].isLoading) {
      this.messages[lastIndex] = message;
    } else {
      this.messages.push(message);
    }
  }

  /**
   * Scrolls the chat container to the bottom
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  /**
   * Toggles the chat widget open/closed state
   */
  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }
  }

  /**
   * Reset the chat conversation
   */
  resetChat(): void {
    this.chatService.clearConversation();
    this.messages = [{
      role: 'assistant',
      content: 'Hi there! 👋 I\'m ShoeBot, your shoe shopping assistant. How can I help you today?',
      timestamp: new Date()
    }];
  }

  /**
   * Handle specific order status request
   * @param orderNumber The order number to check
   */
  private handleSpecificOrder(orderNumber: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.orderService.getOrders(userId).subscribe({
      next: (orders) => {
        const order = orders.find(o => o.orderId === orderNumber);

        if (order) {
          const formattedDate = this.formatDate(order.createdAt);

          this.replaceLoadingMessage({
            role: 'assistant',
            content: `I found order #${orderNumber}!\n\nOrder Date: ${formattedDate}\nStatus: ${order.orderStatus}\nTotal Amount: $${order.totalAmount}\n\nIs there anything else you'd like to know about this order?`,
            timestamp: new Date()
          });
        } else {
          this.replaceLoadingMessage({
            role: 'assistant',
            content: `I couldn't find any order with number #${orderNumber}. Please check the order number and try again, or say "show my orders" to see all your recent orders.`,
            timestamp: new Date()
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching order:', error);
        this.replaceLoadingMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an issue while trying to retrieve your order information. Please try again later.',
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle request for recent orders
   */
  private handleRecentOrders(): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.orderService.getOrders(userId).subscribe({
      next: (orders) => {
        if (orders.length > 0) {
          // Sort orders by date (most recent first)
          const sortedOrders = orders.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          // Display the 3 most recent orders
          const recentOrders = sortedOrders.slice(0, 3);
          let responseContent = 'Here are your most recent orders:\n\n';

          recentOrders.forEach(order => {
            const formattedDate = this.formatDate(order.createdAt);
            responseContent += `Order #${order.orderId} - ${formattedDate}\n`;
            responseContent += `Status: ${order.orderStatus}\n`;
            responseContent += `Amount: $${order.totalAmount}\n\n`;
          });

          responseContent += `You have a total of ${orders.length} orders. To check a specific order, just tell me the order number.`;

          this.replaceLoadingMessage({
            role: 'assistant',
            content: responseContent,
            timestamp: new Date()
          });
        } else {
          this.replaceLoadingMessage({
            role: 'assistant',
            content: "You don't have any orders yet. When you make your first purchase, you'll be able to track it here!",
            timestamp: new Date()
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
        this.replaceLoadingMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an issue while trying to retrieve your order history. Please try again later.',
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Handle viewing the wishlist - using direct API calls like the wishlist component
   */
  private handleViewWishlist(): void {
    const userId = this.authService.getCurrentUserId();
    console.log('Viewing wishlist for user ID:', userId);

    if (!userId) {
      console.error('User ID is null or undefined');
      return;
    }

    // Replace loading message with a temporary message
    this.replaceLoadingMessage({
      role: 'assistant',
      content: 'Fetching your wishlist...',
      timestamp: new Date()
    });

    // Skip the AI completely and directly fetch from API
    this.isLoading = true;
    console.log('Calling wishlistService.getWishlist with userId:', userId);

    this.wishlistService.getWishlist(userId).subscribe({
      next: (wishlist) => {
        console.log('WISHLIST API RESPONSE:', wishlist);
        console.log('Wishlist type:', typeof wishlist);
        console.log('Wishlist length:', wishlist ? wishlist.length : 'N/A');

        if (wishlist && wishlist.length > 0) {
          console.log('Wishlist items found:', wishlist.length);
          console.log('First item sample:', JSON.stringify(wishlist[0]));

          // Display the actual wishlist items with images and details
          this.replaceLoadingMessage({
            role: 'assistant',
            content: `Here are the ${wishlist.length} items in your wishlist:`,
            timestamp: new Date(),
            wishlistItems: wishlist
          });
        } else {
          console.log('Wishlist is empty or undefined');
          this.replaceLoadingMessage({
            role: 'assistant',
            content: 'Your wishlist is currently empty. Add some products to your wishlist and they will appear here!',
            timestamp: new Date()
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching wishlist:', error);
        console.error('Error details:', JSON.stringify(error));
        this.replaceLoadingMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an issue while trying to retrieve your wishlist. Please try again later.',
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Extract product ID from message
   */
  private extractProductId(message: string): number | null {
    // Look for patterns like "product #123", "product 123", "#123", etc.
    const productIdRegex = /product\s*(?:#|number|num|no\.?|id)?\s*(\d+)|#(\d+)/i;
    const match = message.match(productIdRegex);

    if (match) {
      return parseInt(match[1] || match[2], 10);
    }

    return null;
  }

  /**
   * Directly handle adding a product to the wishlist
   */
  public handleAddToWishlistDirectly(productId: number): void {
    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      console.error('User ID is null or undefined');
      return;
    }

    // Get product details first
    console.log('Verifying product exists:', productId);
    this.isLoading = true;

    this.chatService.getProductById(productId).subscribe({
      next: (product) => {
        if (product) {
          console.log('Product found, adding to wishlist:', product.name);

          // Replace loading message with a temporary message
          this.replaceLoadingMessage({
            role: 'assistant',
            content: `Adding Product #${productId} (${product.name}) to your wishlist...`,
            timestamp: new Date()
          });

          // Add to wishlist
          this.wishlistService.addToWishlist(userId, [productId]).subscribe({
            next: (response) => {
              console.log('Successfully added to wishlist:', response);
              this.replaceLoadingMessage({
                role: 'assistant',
                content: `Product #${productId} (${product.name}) has been added to your wishlist! Would you like to view your wishlist?`,
                timestamp: new Date()
              });

              // Update app component's wishlist count
              const appComponent = (window as any).appComponent;
              if (appComponent) {
                appComponent.fetchWishlistData(userId);
              }

              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error adding to wishlist:', error);

              let errorMessage = 'Sorry, I couldn\'t add this item to your wishlist.';

              // Check if it's already in the wishlist
              if (error.status === 409 || (error.error && error.error.includes('already exists'))) {
                errorMessage = `Product #${productId} is already in your wishlist.`;
              }

              this.replaceLoadingMessage({
                role: 'assistant',
                content: errorMessage,
                timestamp: new Date(),
                error: true
              });
              this.isLoading = false;
            }
          });
        } else {
          console.log('Product not found:', productId);
          this.replaceLoadingMessage({
            role: 'assistant',
            content: `I couldn't find Product #${productId} in our catalog. Please check the product number and try again.`,
            timestamp: new Date(),
            error: true
          });
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error verifying product:', error);
        this.replaceLoadingMessage({
          role: 'assistant',
          content: `I couldn't verify Product #${productId}. Please try again later.`,
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }

  /**
   * Shows detailed product information when users express interest in a specific product
   * @param productId The product ID to display
   */
  private showDetailedProductInfo(productId: number): void {
    console.log('Showing detailed product info for:', productId);
    this.isLoading = true;

    this.chatService.getProductById(productId).subscribe({
      next: (product) => {
        if (product) {
          console.log('Found product details:', product.name);

          // Create a featured product suggestion
          const featuredProduct: ProductSuggestion = {
            productId: product.productId,
            name: product.name,
            price: product.price,
            image: product.img[0]
          };

          // Replace loading message with a response including detailed product view
          this.replaceLoadingMessage({
            role: 'assistant',
            content: `Great choice! Here are the details for ${product.name} (Product #${productId}):\n\n${product.description}\n\nWould you like to add this to your cart or wishlist?`,
            timestamp: new Date(),
            featuredProduct: featuredProduct
          });
          this.isLoading = false;
        } else {
          this.replaceLoadingMessage({
            role: 'assistant',
            content: `I couldn't find Product #${productId} in our catalog. Please check the product number and try again.`,
            timestamp: new Date(),
            error: true
          });
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching product details:', error);
        this.replaceLoadingMessage({
          role: 'assistant',
          content: `I'm having trouble retrieving details for Product #${productId}. Please try again later.`,
          timestamp: new Date(),
          error: true
        });
        this.isLoading = false;
      }
    });
  }
}

