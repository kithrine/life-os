import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-up(.*)", "/sso-callback(.*)"]);

export default clerkMiddleware((auth, request) => {
  // LOCAL DEV ONLY - set NEXT_PUBLIC_BYPASS_AUTH=true in .env.local to bypass auth
  // Never set this in .env or .env.example
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "true") {
    return;
  }

  if (!isPublicRoute(request)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
