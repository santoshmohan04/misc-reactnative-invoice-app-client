export interface AuthSession {
  token: string | null;
  refreshToken: string | null;
}

export interface RefreshResult {
  token: string | null;
  refreshToken: string | null;
}

export type SessionReader = () => AuthSession;
export type SessionWriter = (tokens: RefreshResult) => void;
export type SessionClearer = () => void;
