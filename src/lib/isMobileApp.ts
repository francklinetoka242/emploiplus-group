export function isMobileApp(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return navigator.userAgent.includes("EmploiPlusApp");
}

export function notifyReactNativeAuthState(type: "AUTHENTICATED" | "SIGNED_OUT") {
  if (!isMobileApp()) {
    return;
  }

  if (typeof window === "undefined") {
    return;
  }

  const reactNativeWebView = (window as Window & {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }).ReactNativeWebView;

  if (!reactNativeWebView || typeof reactNativeWebView.postMessage !== "function") {
    return;
  }

  reactNativeWebView.postMessage(JSON.stringify({ type }));
}
