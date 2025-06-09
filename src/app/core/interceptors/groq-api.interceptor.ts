import { HttpRequest, HttpHandlerFn } from '@angular/common/http';

/**
 * An interceptor that skips other interceptors for specific API endpoints.
 * Used to bypass auth and logging interceptors for external APIs like Groq.
 */
export const groqApiInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Check if the request is going to the Groq API
  if (req.url.includes('api.groq.com')) {
    // Don't modify the request, just pass it through
    console.log('Bypassing interceptors for Groq API call');
    return next(req);
  }

  // For all other requests, continue with other interceptors
  return next(req);
};
