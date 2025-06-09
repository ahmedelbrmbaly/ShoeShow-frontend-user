import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpBackend } from '@angular/common/http';
import { Observable, throwError, of, firstValueFrom } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ProductService } from './product.service';
import { Product, PaginatedResponse, ProductFilters, ProductCategory, ProductGender } from '../models/product.model';
import { CartService } from './cart.service';
import { WishlistService } from './wishlist.service';
import { OrderService } from './order.service';
import { AuthService } from './auth.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface GroqChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    logprobs: any;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ProductSuggestion {
  productId: number;
  name: string;
  price: number;
  image: string;
  productInfoId?: number; // Added to support direct add to cart
  color?: string;
  size?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly GROQ_API_KEY = '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';
  private readonly MODEL = 'llama-3.3-70b-versatile';

  // Store product catalog for the AI to reference
  private productCatalog: Product[] = [];
  private isProductCatalogLoaded = false;

  // Using HttpBackend to bypass all interceptors
  private http: HttpClient;

  // Store conversation history
  private conversationHistory: ChatMessage[] = [
    {
      role: 'system',
      content: `You are ShoeBot, a helpful AI assistant for ShoeShow online shoe store.
      You are friendly, helpful, and knowledgeable about shoes.
      Always respond concisely in a conversational tone, using emojis occasionally and being helpful.
      When suggesting products, mention products available in our store catalog only.
      When users ask about wishlist or products, only suggest products from our catalog.
      For order inquiries, ask for order number if not provided.
      For product recommendations, ask specific questions about preferences.
      Help users find the right shoes based on their needs and preferences.`
    }
  ];

  constructor(
    private handler: HttpBackend,
    private productService: ProductService,
    private cartService: CartService,
    private wishlistService: WishlistService,
    private orderService: OrderService,
    private authService: AuthService
  ) {
    // Create HTTP client that bypasses interceptors
    this.http = new HttpClient(handler);

    // Load the product catalog when service is instantiated
    this.loadProductCatalog();
  }

  /**
   * Load product catalog from the store's API
   * This ensures the AI knows about our actual products
   */
  private loadProductCatalog(): void {
    this.productService.getProducts({ pageSize: 100 }).subscribe({
      next: (response) => {
        this.productCatalog = response.data;
        this.isProductCatalogLoaded = true;
        console.log(`Product catalog loaded: ${this.productCatalog.length} products`);

        // Update AI system prompt with store catalog info
        this.updateAIWithProductCatalog();
      },
      error: (error) => {
        console.error('Error loading product catalog:', error);
      }
    });
  }

  /**
   * Update AI system prompt with product catalog information
   */
  private updateAIWithProductCatalog(): void {
    if (this.productCatalog.length === 0) return;

    // Create a condensed list of products for the AI to reference
    let productList = 'Our store offers the following products:\n';

    this.productCatalog.forEach(product => {
      // Since 'gender' doesn't exist on the Product interface, use a safer approach
      // Try to infer gender from product name or just use a generic description
      let genderLabel = '';
      const productNameLower = product.name.toLowerCase();

      if (productNameLower.includes('male') || productNameLower.includes('men')) {
        genderLabel = '(Male)';
      } else if (productNameLower.includes('female') || productNameLower.includes('women')) {
        genderLabel = '(Female)';
      }

      productList += `- ${product.name} ${genderLabel}: Product #${product.productId}, $${product.price}\n`;
    });

    // Update the system prompt
    if (this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
      this.conversationHistory[0].content += `\n\n${productList}\n\nWhen users ask to add products to wishlist, cart, or view products, ONLY reference products from this list by ID.`;
    }
  }

  /**
   * Send a message to Groq API and get a response
   * @param message User message
   * @returns Observable with assistant's response
   */
  sendMessage(message: string): Observable<string> {
    // Add user message to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: message
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.GROQ_API_KEY}`
    });

    return this.http.post<GroqChatResponse>(
      this.GROQ_API_URL,
      {
        model: this.MODEL,
        messages: this.conversationHistory,
        temperature: 0.7,
        max_tokens: 1024
      },
      { headers }
    ).pipe(
      map(response => {
        const assistantMessage = response.choices[0].message;
        // Add assistant's response to conversation history
        this.conversationHistory.push(assistantMessage);
        return assistantMessage.content;
      }),
      catchError(error => {
        console.error('Error calling Groq API:', error);
        return throwError(() => 'Sorry, I encountered an issue connecting to my brain. Please try again later! 🙇‍♂️');
      })
    );
  }

  /**
   * Clear conversation history
   */
  clearConversation(): void {
    // Keep only the system message
    this.conversationHistory = this.conversationHistory.slice(0, 1);
  }

  /**
   * Get product recommendations based on filters
   * @param filters Product filters
   * @returns Observable with product suggestions
   */
  getProductRecommendations(filters: ProductFilters): Observable<ProductSuggestion[]> {
    // Make sure we set a reasonable page size
    const searchFilters = {
      ...filters,
      pageNumber: 0,
      pageSize: 6 // Get more products for better recommendations
    };

    return this.productService.getProducts(searchFilters).pipe(
      map(response => {
        if (response && response.data && response.data.length > 0) {
          return response.data.map(product => {
            // Find a product info with stock (if available)
            const availableInfo = product.productInfos && product.productInfos.length > 0 ?
              product.productInfos.find(info => info.quantity > 0) : null;

            return {
              productId: product.productId,
              name: product.name,
              price: product.price,
              image: product.img[0],
              productInfoId: availableInfo?.productInfoId,
              color: availableInfo?.color,
              size: availableInfo?.size
            };
          }).slice(0, 3); // Limit to 3 recommendations for display
        }
        return [];
      }),
      catchError(error => {
        console.error('Error getting product recommendations:', error);
        return throwError(() => 'Failed to get product recommendations');
      })
    );
  }

  /**
   * Get product by ID - useful for AI to verify product exists
   * @param productId Product ID
   * @returns Observable with product or null if not found
   */
  getProductById(productId: number): Observable<Product | null> {
    // First check local catalog
    if (this.isProductCatalogLoaded) {
      const foundProduct = this.productCatalog.find(p => p.productId === productId);
      if (foundProduct) {
        return of(foundProduct);
      }
    }

    // If not in local catalog or catalog not loaded, fetch from API
    return this.productService.getProductById(productId).pipe(
      map(product => product),
      catchError(error => {
        console.error(`Product #${productId} not found:`, error);
        return of(null);
      })
    );
  }

  /**
   * Get product details by ID (with Promise support)
   * @param id The product ID
   * @returns Promise with product details
   */
  async getProductByIdPromise(id: number): Promise<Product> {
    try {
      return await firstValueFrom(this.productService.getProductById(id));
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  }

  /**
   * Find products by name (fuzzy search)
   * @param name Product name to search
   * @returns Observable with matching products
   */
  findProductsByName(name: string): Observable<Product[]> {
    // First check local catalog
    if (this.isProductCatalogLoaded && name) {
      const nameLower = name.toLowerCase();
      const matchingProducts = this.productCatalog.filter(
        p => p.name.toLowerCase().includes(nameLower)
      );

      if (matchingProducts.length > 0) {
        return of(matchingProducts);
      }
    }

    // If not in local catalog or no matches, search API
    return this.productService.searchProducts(name).pipe(
      map(response => response.data),
      catchError(error => {
        console.error(`Error searching for "${name}":`, error);
        return of([]);
      })
    );
  }

  /**
   * Add item to cart
   * @param userId User ID
   * @param productId Product ID
   * @param productInfoId Product info ID
   * @param quantity Quantity
   */
  addToCart(userId: number, productId: number, productInfoId: number, quantity: number = 1): Observable<boolean> {
    if (!userId || !productId || !productInfoId) {
      return throwError(() => 'Missing required parameters for adding to cart');
    }

    return this.cartService.addToCart(userId, {
      productId,
      productInfoId,
      quantity
    }).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error adding to cart:', error);
        return of(false);
      })
    );
  }

  /**
   * Add item to wishlist
   * @param userId User ID
   * @param productId Product ID
   */
  addToWishlist(userId: number, productId: number): Observable<boolean> {
    if (!userId || !productId) {
      return throwError(() => 'Missing required parameters for adding to wishlist');
    }

    return this.wishlistService.addToWishlist(userId, [productId]).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error adding to wishlist:', error);
        return of(false);
      })
    );
  }

  /**
   * Get wishlist items directly - bypassing AI responses
   * @param userId User ID
   * @returns Observable with wishlist items
   */
  getWishlistItems(userId: number): Observable<any[]> {
    if (!userId) {
      return throwError(() => 'User ID is required to view wishlist');
    }

    return this.wishlistService.getWishlist(userId).pipe(
      catchError(error => {
        console.error('Error fetching wishlist:', error);
        return throwError(() => 'Failed to retrieve wishlist items');
      })
    );
  }

  /**
   * Process checkout
   * @param userId User ID
   */
  checkout(userId: number): Observable<boolean> {
    if (!userId) {
      return throwError(() => 'User ID is required for checkout');
    }

    return this.orderService.placeOrder(userId).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error during checkout:', error);
        if (error.error?.message) {
          return throwError(() => error.error.message);
        }
        return throwError(() => 'Failed to process checkout');
      })
    );
  }

  /**
   * Extract order number from message
   * @param message User message
   * @returns Order number if found, null otherwise
   */
  extractOrderNumber(message: string): number | null {
    // Look for patterns like "order #123", "order 123", "order number 123", etc.
    const orderNumberRegex = /order\s*(?:#|number|num|no\.?|id)?\s*(\d+)/i;
    const match = message.match(orderNumberRegex);

    if (match && match[1]) {
      return parseInt(match[1], 10);
    }

    return null;
  }

  /**
   * Extract product ID from message
   * @param message User message
   * @returns Product ID if found, null otherwise
   */
  extractProductId(message: string): number | null {
    // Look for patterns like "product #123", "product 123", "#123", etc.
    const productIdRegex = /product\s*(?:#|number|num|no\.?|id)?\s*(\d+)|#(\d+)/i;
    const match = message.match(productIdRegex);

    if (match) {
      return parseInt(match[1] || match[2], 10);
    }

    return null;
  }

  /**
   * Extract product preferences from user message
   * @param message User message
   * @returns Product filters based on message content
   */
  extractProductPreferences(message: string): ProductFilters {
    const lowerMessage = message.toLowerCase();
    const filters: ProductFilters = {};

    // Extract gender
    if (lowerMessage.includes('male') || lowerMessage.includes('men') ||
        lowerMessage.includes('man') || lowerMessage.includes('boy')) {
      filters.gender = 'MALE';
    } else if (lowerMessage.includes('female') || lowerMessage.includes('women') ||
               lowerMessage.includes('woman') || lowerMessage.includes('girl')) {
      filters.gender = 'FEMALE';
    }

    // Extract category
    if (lowerMessage.includes('sneakers') || lowerMessage.includes('sneaker')) {
      filters.category = 'SNEAKERS';
    } else if (lowerMessage.includes('classic')) {
      filters.category = 'CLASSIC';
    } else if (lowerMessage.includes('casual')) {
      filters.category = 'CASUAL';
    }

    // Extract brands
    const brands = ['nike', 'adidas', 'puma', 'reebok', 'new balance'];
    for (const brand of brands) {
      if (lowerMessage.includes(brand)) {
        filters.brand = filters.brand || [];
        filters.brand.push(brand.charAt(0).toUpperCase() + brand.slice(1)); // Capitalize first letter
      }
    }

    // Extract colors
    const colors = ['black', 'white', 'blue', 'grey', 'gray', 'brown', 'red'];
    for (const color of colors) {
      if (lowerMessage.includes(color)) {
        filters.color = filters.color || [];
        filters.color.push(color.charAt(0).toUpperCase() + color.slice(1)); // Capitalize first letter
      }
    }

    // Extract sizes
    // Look for patterns like "size 42", "42", "EU 42"
    const sizeRegex = /\b(?:size\s*)?(\d{2})(?:\s*eu)?\b/gi;
    let match;
    while ((match = sizeRegex.exec(message)) !== null) {
      const size = parseInt(match[1], 10);
      if (size >= 35 && size <= 50) {
        filters.size = filters.size || [];
        filters.size.push(`SIZE_${size}`);
      }
    }

    return filters;
  }
}
