export class User {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
    this.role = data.role || 'User';
    this.token = data.token || '';
  }

  isAdmin() {
    return this.role === 'Admin';
  }
}
