const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const setAuthCookie = (token: string) => {
  if (typeof document === 'undefined') {
    return;
  }

  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;
};

export const clearAuthCookie = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const secureFlag = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `auth_token=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`;
};
