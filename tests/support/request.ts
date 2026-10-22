/** Sets the headers returned by the mocked `next/headers` for the current test. */
export function setRequestHeaders(init: HeadersInit = {}) {
  (globalThis as { __requestHeaders?: Headers }).__requestHeaders = new Headers(init);
}
