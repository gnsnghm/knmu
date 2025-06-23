// frontend/middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/access")) return NextResponse.next(); // ループ防止
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const email = req.headers.get("cf-access-authenticated-user-email");
  if (!email) return NextResponse.redirect(new URL("/access/login", req.url));
  const res = NextResponse.next();
  res.cookies.set("user", email);
  return res;
}
