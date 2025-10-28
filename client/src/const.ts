export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "UniTutor";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO || "/logo.svg";

// Google OAuth login URL
export const getLoginUrl = () => {
  const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('access_type', 'online');
  url.searchParams.set('prompt', 'select_account');
  
  return url.toString();
};

