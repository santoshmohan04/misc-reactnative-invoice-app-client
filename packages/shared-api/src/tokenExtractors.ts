export const unwrapSuccessPayload = <T>(responseBody: T): unknown => {
  if (responseBody && typeof responseBody === 'object' && 'data' in (responseBody as Record<string, unknown>)) {
    return ((responseBody as unknown) as { data: unknown }).data;
  }
  return responseBody;
};

export const extractAccessToken = (response: Response | undefined, parsedBody: unknown): string | null => {
  const headerToken = response?.headers.get('x-auth')
    || response?.headers.get('x-access-token')
    || response?.headers.get('authorization');

  if (headerToken) {
    return headerToken.replace(/^Bearer\\s+/i, '');
  }

  const payload = unwrapSuccessPayload(parsedBody);
  if (payload && typeof payload === 'object') {
    const tokenPayload = payload as {
      accessToken?: string;
      token?: string;
      authToken?: string;
      tokens?: { accessToken?: string; token?: string };
    };

    return tokenPayload.accessToken
      || tokenPayload.token
      || tokenPayload.authToken
      || tokenPayload.tokens?.accessToken
      || tokenPayload.tokens?.token
      || null;
  }

  return null;
};

export const extractRefreshToken = (response: Response | undefined, parsedBody: unknown): string | null => {
  const headerRefreshToken = response?.headers.get('x-refresh-token');
  if (headerRefreshToken) {
    return headerRefreshToken;
  }

  const payload = unwrapSuccessPayload(parsedBody);
  if (payload && typeof payload === 'object') {
    const refreshPayload = payload as {
      refreshToken?: string;
      tokens?: { refreshToken?: string };
    };

    return refreshPayload.refreshToken
      || refreshPayload.tokens?.refreshToken
      || null;
  }

  return null;
};
