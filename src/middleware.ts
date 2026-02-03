import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: Run next-intl middleware to handle locale detection/routing
  const response = intlMiddleware(request);

  // Step 2: Run Supabase session refresh on the response
  const { user, response: supabaseResponse } = await updateSession(
    request,
    response
  );

  // Step 3: Protect dashboard routes - redirect to login if unauthenticated
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute =
    pathname.includes("/(dashboard)") ||
    pathname.match(/^\/(en|ar)?\/?((new-video|my-videos|bulk|settings))/);

  if (isDashboardRoute && !user) {
    const locale = pathname.startsWith("/ar") ? "ar" : "en";
    const loginUrl = new URL(
      locale === "en" ? "/login" : `/${locale}/login`,
      request.url
    );
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except static files and API routes
    "/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
