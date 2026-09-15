import {
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

const BASE_URL = "https://localhost:7014/api";

let refreshPromise: Promise<boolean> | null = null;

function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/Auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function createBaseQueryWithReauth(
  apiPath: string,
): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${BASE_URL}/${apiPath}`,
    credentials: "include",
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
      const url = typeof args === "string" ? args : args.url;
      const isAuthEndpoint =
        url?.includes("/login") || url?.includes("/refresh") || url?.includes("/me");

      if (!isAuthEndpoint) {
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch({ type: "auth/resetStore" });
          window.location.href = "/Login";
        }
      }
    }

    return result;
  };
}