interface LoginResponse {
  token: string;
  user: {
    username: string;
    role: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    this.token = localStorage.getItem('adminToken');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      this.token = data.token;
      localStorage.setItem('adminToken', data.token);
      return data;
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  public logout(): void {
    this.token = null;
    localStorage.removeItem('adminToken');
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public getToken(): string | null {
    return this.token;
  }
}

export default AuthService; 