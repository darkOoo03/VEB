export class Expense {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.category = data.category || 'ostalo'; // prevoz, smještaj, hrana, ulaznice, kupovina, ostalo
    this.amount = data.amount || 0;
    this.date = data.date ? new Date(data.date) : null;
    this.description = data.description || '';
    this.travelPlanId = data.travelPlanId || '';
  }
}
