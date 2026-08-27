import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_COOKIE = "admin_last_activity";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminRoute = path.startsWith("/admin") && path !== "/admin/login";

  // Fast path: Check if any Supabase auth cookie is present
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith("sb-") || c.name.includes("auth-token")
  );

  // If accessing an admin route without any auth cookie, instantly redirect to /admin/login
  if (isAdminRoute && !hasAuthCookie) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login page without any auth cookie, proceed immediately
  if (path === "/admin/login" && !hasAuthCookie) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = supabaseUrl && supabaseKey && !supabaseUrl.includes("your-project");

  let user = null;
  let supabaseClient: any = null;

  if (isConfigured) {
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              response.cookies.set({ name, value: "", ...options });
            },
          },
        }
      );

      supabaseClient = supabase;
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }
  }

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check last activity timestamp for 5-minute timeout
    const lastActivityStr = request.cookies.get(ACTIVITY_COOKIE)?.value;
    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10);
      if (!isNaN(lastActivity) && Date.now() - lastActivity >= TIMEOUT_MS) {
        // Session timed out - sign out and redirect to login
        if (supabaseClient) {
          try {
            await supabaseClient.auth.signOut();
          } catch {}
        }

        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("reason", "timeout");
        const redirectRes = NextResponse.redirect(loginUrl);
        redirectRes.cookies.set(ACTIVITY_COOKIE, "", { path: "/", maxAge: 0 });
        return redirectRes;
      }
    }

    // Update last activity cookie
    response.cookies.set(ACTIVITY_COOKIE, Date.now().toString(), {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    });
  }

  if (path === "/admin/login" && user) {
    // If not timed out, redirect logged-in user away from login page to /admin
    const lastActivityStr = request.cookies.get(ACTIVITY_COOKIE)?.value;
    if (lastActivityStr) {
      const lastActivity = parseInt(lastActivityStr, 10);
      if (!isNaN(lastActivity) && Date.now() - lastActivity < TIMEOUT_MS) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};


