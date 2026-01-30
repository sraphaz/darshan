import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { sessionCookieHeader } from "@/lib/auth";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function getRedirectUri(headersList: Headers): string {
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
  const proto = headersList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}/api/auth/callback/google`;
}

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?error=google_not_configured", req.url));
  }
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  if (error) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, req.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", req.url));
  }
  const headersList = await headers();
  const redirectUri = getRedirectUri(headersList);

  let tokenRes: Response;
  try {
    tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
  } catch (e) {
    console.error("[auth/callback/google] token exchange failed:", e);
    return NextResponse.redirect(new URL("/?error=token_exchange_failed", req.url));
  }

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error("[auth/callback/google] token error:", tokenRes.status, text);
    return NextResponse.redirect(new URL("/?error=token_failed", req.url));
  }

  let tokenData: { access_token?: string };
  try {
    tokenData = await tokenRes.json();
  } catch {
    return NextResponse.redirect(new URL("/?error=token_parse", req.url));
  }
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/?error=no_access_token", req.url));
  }

  let userRes: Response;
  try {
    userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (e) {
    console.error("[auth/callback/google] userinfo failed:", e);
    return NextResponse.redirect(new URL("/?error=userinfo_failed", req.url));
  }

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/?error=userinfo_failed", req.url));
  }

  let userData: { email?: string };
  try {
    userData = await userRes.json();
  } catch {
    return NextResponse.redirect(new URL("/?error=userinfo_parse", req.url));
  }
  const email = typeof userData.email === "string" ? userData.email.trim() : "";
  if (!email) {
    return NextResponse.redirect(new URL("/?error=no_email", req.url));
  }

  audit("login_google", email);
  const res = NextResponse.redirect(new URL("/", req.url));
  res.headers.set("Set-Cookie", sessionCookieHeader({ email }));
  return res;
}
