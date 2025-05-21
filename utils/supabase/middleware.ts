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
    const user = await supabase.auth.getUser();

    if (request.nextUrl.pathname.startsWith("/") && user.error && request.nextUrl.pathname === "/sign-up") {
      return NextResponse.redirect(new URL("/sign-up", request.url));
    }
    // protected routes
    if (request.nextUrl.pathname.startsWith("/") && user.error && request.nextUrl.pathname !== "/sign-in") {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // if (request.nextUrl.pathname === "/" && !user.error) {
    //   return NextResponse.redirect(new URL("/protected", request.url));
    // }

    return res;
  } catch (error: any) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
