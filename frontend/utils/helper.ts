export type DeviceType = "mobile" | "tablet" | "laptop" | "unknown";

export const getDeviceType = (): DeviceType => {
  const ua = navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(ua)) {
    return "mobile";
  }

  if (/ipad|tablet|playbook|silk|android(?!.*mobile)/.test(ua)) {
    return "tablet";
  }

  if (/macintosh|windows|linux/.test(ua)) {
    return "laptop";
  }

  // fallback for cases like responsive preview tools
  if (width >= 600 && width <= 1024) return "tablet";
  if (width > 1024) return "laptop";
  return "mobile";
};


export const myLocalLog = (...args: any[]): void => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "::1"; // IPv6 localhost

  if (isLocalhost) {
    console.log(...args);
  }
};
