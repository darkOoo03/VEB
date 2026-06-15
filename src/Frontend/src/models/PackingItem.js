export class PackingItem {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.isCompleted = !!data.isCompleted;
    this.travelPlanId = data.travelPlanId || '';
  }
}
