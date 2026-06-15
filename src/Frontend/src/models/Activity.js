export class Activity {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.date = data.date ? new Date(data.date) : null;
    this.time = data.time || '';
    this.location = data.location || '';
    this.description = data.description || '';
    this.estimatedCost = data.estimatedCost || 0;
    this.status = data.status || 'planirano'; // planirano, rezervisano, završeno, otkazano
    this.travelPlanId = data.travelPlanId || '';
  }
}
