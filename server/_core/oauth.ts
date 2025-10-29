import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { SignJWT } from "jose";

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.VITE_OAUTH_CLIENT_ID!,
      client_secret: process.env.OAUTH_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return await response.json();
}

async function getUserInfo(accessToken: string) {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${response.statusText}`);
  }

  return await response.json();
}

async function createSessionToken(openId: string, name: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
  
  const token = await new SignJWT({ 
    openId, 
    name,
    appId: process.env.VITE_APP_ID || 'unitutor'
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('365d')
    .sign(secret);
  
  return token;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");

    if (!code) {
      res.status(400).json({ error: "code is required" });
      return;
    }

    try {
      const redirectUri = `${process.env.OAUTH_SERVER_URL || req.protocol + '://' + req.get('host')}/api/oauth/callback`;
      
      const tokenResponse = await exchangeCodeForToken(code, redirectUri);
      const userInfo = await getUserInfo(tokenResponse.access_token);

      if (!userInfo.id) {
        res.status(400).json({ error: "User ID missing from Google response" });
        return;
      }

      const openId = `google_${userInfo.id}`;

      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email || null,
        loginMethod: 'google',
        lastSignedIn: new Date(),
      });

      const sessionToken = await createSessionToken(openId, userInfo.name || '');

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

