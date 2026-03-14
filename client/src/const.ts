export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate GitHub OAuth login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
    const clientId = import.meta.env.VITE_APP_ID;
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const scope = "user:email";

    const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: scope,
          allow_signup: "true",
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
};
