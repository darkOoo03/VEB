import { Activity } from '../models/Activity';
import { Expense } from '../models/Expense';

class ActivityService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_ACTIVITY_API_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async getActivities(planId) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/activities`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri dohvatanju aktivnosti.');
    }

    return data.map(a => new Activity(a));
  }

  async addActivity(planId, activityData, plannedBudget = 0) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/activities?plannedBudget=${plannedBudget}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(activityData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri dodavanju aktivnosti.');
    }

    return new Activity(data);
  }

  async updateActivity(planId, activityId, activityData, plannedBudget = 0) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/activities/${activityId}?plannedBudget=${plannedBudget}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(activityData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri ažuriranju aktivnosti.');
    }

    return new Activity(data);
  }

  async deleteActivity(planId, activityId, plannedBudget = 0) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/activities/${activityId}?plannedBudget=${plannedBudget}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri brisanju aktivnosti.');
    }

    return data;
  }

  // Expense actions
  async getExpenses(planId) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/expenses`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri dohvatanju troškova.');
    }

    return data.map(e => new Expense(e));
  }

  async addExpense(planId, expenseData, plannedBudget = 0) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/expenses?plannedBudget=${plannedBudget}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(expenseData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri dodavanju troška.');
    }

    return new Expense(data);
  }

  async updateExpense(planId, expenseId, expenseData, plannedBudget = 0) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/expenses/${expenseId}?plannedBudget=${plannedBudget}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(expenseData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri ažuriranju troška.');
    }

    return new Expense(data);
  }

  async deleteExpense(planId, expenseId, plannedBudget = 0) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/expenses/${expenseId}?plannedBudget=${plannedBudget}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri brisanju troška.');
    }

    return data;
  }

  // Budget summary (Stateful Service)
  async getBudgetSummary(planId, plannedBudget = 0) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/budget-summary?plannedBudget=${plannedBudget}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri dohvatanju budžeta.');
    }

    return data; // returns PlannedBudget, TotalExpenses, RemainingBudget, TotalEstimatedActivityCosts
  }
}

export const activityService = new ActivityService();
export default activityService;
