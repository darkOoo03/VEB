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

  async handleResponse(response, defaultErrorMsg) {
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Vaša sesija je istekla. Molimo vas da se odjavite i ponovo prijavite.');
      }
      let errorMsg = defaultErrorMsg;
      try {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          errorMsg = data.message || errorMsg;
        }
      } catch (e) {
        // failed to parse JSON, keep default
      }
      throw new Error(errorMsg);
    }

    try {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (e) {
      throw new Error('Greška pri obradi podataka sa servera.');
    }
  }

  async getPlans(shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await this.handleResponse(response, 'Greška pri dohvatanju planova.');
    return data ? data.map(p => new TravelPlan(p)) : [];
  }

  async getPlan(id, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${id}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const data = await this.handleResponse(response, 'Plan nije pronađen.');
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

    const data = await this.handleResponse(response, 'Greška pri kreiranju plana.');
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

    const data = await this.handleResponse(response, 'Greška pri ažuriranju plana.');
    return new TravelPlan(data);
  }

  async deletePlan(id) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return await this.handleResponse(response, 'Greška pri brisanju plana.');
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

    const data = await this.handleResponse(response, 'Greška pri dodavanju destinacije.');
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

    const data = await this.handleResponse(response, 'Greška pri ažuriranju destinacije.');
    return new Destination(data);
  }

  async deleteDestination(planId, destId, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/destinations/${destId}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return await this.handleResponse(response, 'Greška pri brisanju destinacije.');
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

    const data = await this.handleResponse(response, 'Greška pri dodavanju stavke.');
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

    const data = await this.handleResponse(response, 'Greška pri ažuriranju stavke.');
    return new PackingItem(data);
  }

  async deletePackingItem(planId, itemId, shareToken = null) {
    const url = new URL(`${this.apiUrl}/travel-plans/${planId}/packing-list/${itemId}`);
    if (shareToken) url.searchParams.append('shareToken', shareToken);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return await this.handleResponse(response, 'Greška pri brisanju stavke.');
  }

  // Sharing
  async generateShareToken(planId, accessLevel) {
    const response = await fetch(`${this.apiUrl}/travel-plans/${planId}/shares`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ accessLevel })
    });

    return await this.handleResponse(response, 'Greška pri generisanju linka.');
  }

  async getPlanByShareToken(token) {
    const response = await fetch(`${this.apiUrl}/travel-plans/shares/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await this.handleResponse(response, 'Plan za deljenje nije dostupan.');
    return {
      plan: new TravelPlan(data.plan),
      accessLevel: data.accessLevel
    };
  }
}

export const travelService = new TravelService();
export default travelService;
