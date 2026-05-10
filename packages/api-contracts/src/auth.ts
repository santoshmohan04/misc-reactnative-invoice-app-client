export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface SignupRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface TokenBundle {
  token: string | null;
  refreshToken: string | null;
}

export interface AuthUserDto {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface AuthResponseDto extends TokenBundle {
  user: AuthUserDto | null;
}
