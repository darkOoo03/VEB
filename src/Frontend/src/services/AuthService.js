import { User } from '../models/User';

class AuthService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_AUTH_API_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async register(name, email, password, role = 'User') {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška prilikom registracije.');
    }
    return new User(data);
  }

  async login(email, password) {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška prilikom prijave.');
    }
    return new User(data);
  }

  async getUsers() {
    const response = await fetch(`${this.apiUrl}/auth/users`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška prilikom dohvatanja korisnika.');
    }
    return data.map(u => new User(u));
  }

  async deleteUser(id) {
    const response = await fetch(`${this.apiUrl}/auth/users/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška prilikom brisanja korisnika.');
    }
    return data;
  }
}

export const authService = new AuthService();
export default authService;
