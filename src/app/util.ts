// src/app/util.ts
const BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  process.env.BACKEND_URL ||
  "http://localhost:8000";

const ML_URL = "http://localhost:8080";
/**
 * We'll extend RequestInit with our own `jsonBody` property:
 * - `jsonBody?: unknown`: for passing an object that we want auto-JSON-stringified
 * - `body?: BodyInit`: the normal fetch body if we have raw data (FormData, string, etc.)
 */
interface FetchOptions extends Omit<RequestInit, "body"> {
  jsonBody?: unknown; // an object or anything else you want to be auto-stringified
  body?: BodyInit | null; // still allow the normal `fetch` body property
}

/**
 * A helper that handles JSON (when `jsonBody` is provided) + cookies + error checks.
 */
async function request<T>(
  route: string,
  { method, headers, jsonBody, body, ...rest }: FetchOptions = {}
): Promise<T> {
  const url = `${BASE_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`;

  // If jsonBody is provided, we stringify it and set JSON headers
  let finalBody: BodyInit | undefined = undefined;
  let finalHeaders: HeadersInit = { ...headers };

  if (jsonBody !== undefined) {
    // auto-stringify
    finalBody = JSON.stringify(jsonBody);
    // make sure we have JSON headers
    finalHeaders = {
      "Content-Type": "application/json",
      ...finalHeaders,
    };
  } else if (body !== undefined && body !== null) {
    // if the user gave us raw body, just pass it along
    finalBody = body;
    // if it's a string or other type, the user is responsible for appropriate headers
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials: "include", // critical for cookie-based auth
    body: finalBody,
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  // Attempt to parse JSON response (adjust if your server sometimes returns non-JSON)
  return response.json() as Promise<T>;
}

/**
 * GET request
 */
export async function get<T>(route: string, options?: FetchOptions) {
  return request<T>(route, { method: "GET", ...options });
}

/**
 * POST request
 */
export async function post<T>(route: string, options?: FetchOptions) {
  return request<T>(route, { method: "POST", ...options });
}

/**
 * PUT request
 */
export async function put<T>(route: string, options?: FetchOptions) {
  return request<T>(route, { method: "PUT", ...options });
}

/**
 * DELETE request
 */
export async function del<T>(route: string, options?: FetchOptions) {
  return request<T>(route, { method: "DELETE", ...options });
}

/**
 * PATCH request
 */
export async function patch<T>(route: string, options?: FetchOptions) {
  return request<T>(route, { method: "PATCH", ...options });
}

async function requestML<T>(
  route: string,
  { method, headers, jsonBody, body, ...rest }: FetchOptions = {}
): Promise<T> {
  const url = `${ML_URL.replace(/\/+$/, "")}/${route.replace(/^\/+/, "")}`;

  let finalBody: BodyInit | undefined = undefined;
  let finalHeaders: HeadersInit = { ...headers };

  if (jsonBody !== undefined) {
    finalBody = JSON.stringify(jsonBody);
    finalHeaders = {
      "Content-Type": "application/json",
      ...finalHeaders,
    };
  } else if (body !== undefined && body !== null) {
    finalBody = body;
    // Do NOT set Content-Type for FormData, browser handles it
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    credentials: "include",
    body: finalBody,
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function post_ml<T>(route: string, options?: FetchOptions) {
  return requestML<T>(route, { method: "POST", ...options });
}
