import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

import GoogleProvider from "next-auth/providers/google";

type GoogleRefreshTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
  id_token?: string;
};

type GoogleRefreshTokenError = {
  error?: string;
  error_description?: string;
};

async function refreshGoogleAccessToken(
  token: JWT,
): Promise<JWT> {
  const refreshToken =
    typeof token.refreshToken === "string"
      ? token.refreshToken
      : undefined;

  if (!refreshToken) {
    return {
      ...token,
      error: "MissingRefreshToken",
    };
  }

  try {
    const response = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body: new URLSearchParams({
          client_id:
            process.env.GOOGLE_CLIENT_ID ?? "",

          client_secret:
            process.env.GOOGLE_CLIENT_SECRET ?? "",

          grant_type: "refresh_token",

          refresh_token: refreshToken,
        }),
      },
    );

    const refreshedTokens =
      (await response.json()) as
        | GoogleRefreshTokenResponse
        | GoogleRefreshTokenError;

    if (
  !response.ok ||
  !("access_token" in refreshedTokens)
) {
  let message =
    "Unable to refresh Google access token.";

  if (
    "error_description" in refreshedTokens &&
    typeof refreshedTokens.error_description ===
      "string"
  ) {
    message =
      refreshedTokens.error_description;
  } else if (
    "error" in refreshedTokens &&
    typeof refreshedTokens.error === "string"
  ) {
    message = refreshedTokens.error;
  }

  throw new Error(message);
}
    

    return {
      ...token,

      accessToken:
        refreshedTokens.access_token,

      accessTokenExpires:
        Date.now() +
        refreshedTokens.expires_in * 1000,

      refreshToken:
        refreshedTokens.refresh_token ??
        refreshToken,

      error: undefined,
    };
  } catch (error) {
    console.error(
      "Google access token refresh failed:",
      error,
    );

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:
        process.env.GOOGLE_CLIENT_ID ?? "",

      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET ?? "",

      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events.readonly",
          ].join(" "),

          /*
           * offline 才有機會取得 refresh token。
           */
          access_type: "offline",

          /*
           * 開發階段要求重新顯示同意頁，
           * 讓 Google 再次提供 refresh token。
           */
          prompt: "consent",
        },
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({
      token,
      account,
    }) {
      /*
       * 第一次 Google 登入時，
       * 把 OAuth token 保存到 NextAuth JWT。
       */
      if (account) {
        return {
          ...token,

          accessToken:
            account.access_token,

          refreshToken:
            account.refresh_token,

          accessTokenExpires:
            account.expires_at
              ? account.expires_at * 1000
              : Date.now() +
                60 * 60 * 1000,

          error: undefined,
        };
      }

      const accessTokenExpires =
        typeof token.accessTokenExpires ===
        "number"
          ? token.accessTokenExpires
          : 0;

      /*
       * access token 尚未過期時直接使用。
       * 提前一分鐘刷新，避免請求途中失效。
       */
      if (
        typeof token.accessToken === "string" &&
        Date.now() <
          accessTokenExpires - 60_000
      ) {
        return token;
      }

      /*
       * access token 過期後使用 refresh token 更新。
       */
      return refreshGoogleAccessToken(token);
    },

    async session({
      session,
      token,
    }) {
      session.accessToken =
        typeof token.accessToken === "string"
          ? token.accessToken
          : undefined;

      session.authError =
        typeof token.error === "string"
          ? token.error
          : undefined;

      return session;
    },
  },

  pages: {
    /*
     * 先使用 NextAuth 預設登入頁面，
     * 所以這裡暫時不用設定 signIn。
     */
  },

  debug:
    process.env.NODE_ENV ===
    "development",
};