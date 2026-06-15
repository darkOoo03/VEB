import { TravelPlan } from '../models/TravelPlan';
import { Destination } from '../models/Destination';
import { PackingItem } from '../models/PackingItem';

class TravelService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_TRAVEL_API_URL;
  }

  getHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  async getPlans(shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Greška pri dohvatanju planova.');
    }

    const data = await response.json();
    return data.map(p => new TravelPlan(p));
  }

  async getPlan(id, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${id}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Plan nije pronađen.');
    }

    return {
      plan: new TravelPlan(data.plan),
      accessLevel: data.accessLevel
    };
  }

  async createPlan(planData) {
    const response = await fetch(`${this.apiUrl}/travel-plans`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(planData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri kreiranju plana.');
    }

    return new TravelPlan(data);
  }

  async updatePlan(id, planData, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${id}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(planData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri ažuriranju plana.');
    }

    return new TravelPlan(data);
  }

  async deletePlan(id) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri brisanju plana.');
    }

    return data;
  }

  // Destination actions
  async addDestination(planId, destData, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/destinations`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(destData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri dodavanju destinacije.');
    }

    return new Destination(data);
  }

  async updateDestination(planId, destId, destData, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/destinations/${destId}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(destData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri ažuriranju destinacije.');
    }

    return new Destination(data);
  }

  async deleteDestination(planId, destId, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/destinations/${destId}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri brisanju destinacije.');
    }

    return data;
  }

  // Packing list actions
  async addPackingItem(planId, itemData, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/packing-list`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri dodavanju stavke.');
    }

    return new PackingItem(data);
  }

  async updatePackingItem(planId, itemId, itemData, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/packing-list/${itemId}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(itemData)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri ažuriranju stavke.');
    }

    return new PackingItem(data);
  }

  async deletePackingItem(planId, itemId, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/packing-list/${itemId}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri brisanju stavke.');
    }

    return data;
  }

  // Sharing
  async generateShareToken(planId, accessLevel) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/shares`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ accessLevel })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Greška pri generisanju linka.');
    }

    return data; // returns share details
  }

  async getPlanByShareToken(token) {
    const response = await fetch(`${this.apiUrl}/travel-plans/shares/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Plan za deljenje nije dostupan.');
    }

    return {
      plan: new TravelPlan(data.plan),
      accessLevel: data.accessLevel
    };
  }
}

export const travelService = new TravelService();
export default travelService;
