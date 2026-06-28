export interface IAuthUser {
  sub: string;
  email: string;
  role: 'admin' | 'student';
  iat?: number;
  exp?: number;
}

export interface IAuthPayload {
  email: string;
  password: string;
}

export interface IAuthResponse {
  user: any;
  access_token: string;
}
