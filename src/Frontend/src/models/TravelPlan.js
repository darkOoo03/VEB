import { Destination } from './Destination';
import { PackingItem } from './PackingItem';

export class TravelPlan {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.description = data.description || '';
    this.startDate = data.startDate ? new Date(data.startDate) : null;
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    this.budget = data.budget || 0;
    this.notes = data.notes || '';
    this.userId = data.userId || '';
    this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
    this.destinations = Array.isArray(data.destinations) 
      ? data.destinations.map(d => new Destination(d)) 
      : [];
    this.packingListItems = Array.isArray(data.packingListItems) 
      ? data.packingListItems.map(i => new PackingItem(i)) 
      : [];
    this.shares = data.shares || [];
  }

  getDaysCount() {
    if (!this.startDate || !this.endDate) return 0;
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }
}
