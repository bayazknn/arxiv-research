import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    const res = NextResponse.next();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            const allCookies = request.cookies.getAll();
            return allCookies;
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              res.cookies.set({
                name: name,
                value: value,
                ...options,
              });
            });
          },
        },
      }
    );

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/sign-in" || pathname === "/sign-up";

  // User not signed in
  if (!user) {
    if (isAuthRoute) {
      return res; // let them access /sign-in and /sign-up
    }

    // block everything else and redirect to sign-in
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // User is signed in and tries to access auth pages
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url)); // or /dashboard
  }

  // User is signed in and accessing protected page
  return res;


  } catch (error: any) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
