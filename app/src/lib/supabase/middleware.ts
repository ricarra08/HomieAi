import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth/callback");

  // API routes authenticate themselves (session auth, signed tokens, x-internal-secret,
  // same-origin checks inside each handler) and must NEVER be redirected to an HTML login
  // page. Anonymous callers are legitimate here: collaborator upload links, claim-invite
  // landings, /try geocoding, and the server-to-server documents/process trigger (which
  // carries no cookies at all). Redirecting them breaks those flows with JSON parse errors.
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");

  const isPublicPage =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/try") ||
    request.nextUrl.pathname.startsWith("/upload") ||
    request.nextUrl.pathname.startsWith("/explain") ||
    request.nextUrl.pathname.startsWith("/join") ||
    request.nextUrl.pathname.startsWith("/claim") ||
    request.nextUrl.pathname.startsWith("/blog") ||
    request.nextUrl.pathname.startsWith("/terms") ||
    request.nextUrl.pathname.startsWith("/privacy");

  const isOnboardingPage =
    request.nextUrl.pathname.startsWith("/onboarding");

  if (!user && !isApiRoute && !isAuthPage && !isPublicPage && !isOnboardingPage && !isAuthCallback) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Profile gate: redirect to onboarding if authenticated user has no profile.
  // API routes are exempt — redirecting a fetch() to an HTML page breaks it, and the
  // onboarding flow itself calls /api/join/resolve BEFORE the profile row exists.
  if (user && !isApiRoute && !isAuthPage && !isPublicPage && !isOnboardingPage) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    } catch {
      // Fail open — if profile query fails, let user through
      // Dashboard will handle gracefully
    }
  }

  return supabaseResponse;
}
