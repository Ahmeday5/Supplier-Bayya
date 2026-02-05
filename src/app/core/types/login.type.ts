export interface LoginCredentials {
  phoneNumber: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  phoneNumber: string;
  name: string;
  email: string;
  token: string | null;
}

export interface UserData {
  name: string;
  phoneNumber: string;
  email: string;
  token: string | null;
}
