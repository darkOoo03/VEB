export class Destination {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.location = data.location || '';
    this.arrivalDate = data.arrivalDate ? new Date(data.arrivalDate) : null;
    this.departureDate = data.departureDate ? new Date(data.departureDate) : null;
    this.notes = data.notes || '';
    this.travelPlanId = data.travelPlanId || '';
  }
}
