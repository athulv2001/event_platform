import { clerkMiddleware } from "@clerk/nextjs/server";

// Default Clerk authentication middleware with custom configuration
export default clerkMiddleware({
  // Public routes you want to exclude from authentication
  publicRoutes: [
    '/',  // Home page
    '/events/:id', // Event page (can be dynamic)
    '/api/webhook/clerk', // Public webhook route
    '/api/webhook/stripe', // Public stripe webhook route
    '/api/uploadthing', // Public upload route
  ],
  // Custom configurations for Clerk middleware
  ignoredRoutes: [
    '/api/webhook/clerk', // Ignore authentication for webhooks
    '/api/webhook/stripe', // Ignore authentication for stripe webhooks
    '/api/uploadthing', // Ignore authentication for upload routes
  ]
});

// Configuration for applying Clerk middleware to specific routes
export const config = {
  // Apply the middleware globally but exclude Next.js internals and static files
  matcher: [
    "/((?!_next|.*\\..*|favicon.ico).*)",  // Excludes Next.js internals and static files
    "/api/(.*)",  // Apply to all API routes
    "/events/:id", // Apply authentication for events pages
  ],
};
