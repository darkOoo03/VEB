import React, { createContext, useState, useContext } from 'react';
import { travelService } from '../services/TravelService';
import { TravelPlan } from '../models/TravelPlan';

const TravelPlanContext = createContext();

export const TravelPlanProvider = ({ children }) => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [accessLevel, setAccessLevel] = useState('NONE'); // NONE, VIEW, EDIT
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlans = async (shareToken = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await travelService.getPlans(shareToken);
      setPlans(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlan = async (id, shareToken = null) => {
    setLoading(true);
    setError(null);
    try {
      const { plan, accessLevel: level } = await travelService.getPlan(id, shareToken);
      setCurrentPlan(plan);
      setAccessLevel(level);
      return { plan, accessLevel: level };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData) => {
    setError(null);
    try {
      const newPlan = await travelService.createPlan(planData);
      setPlans(prev => [newPlan, ...prev]);
      return newPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePlan = async (id, planData, shareToken = null) => {
    setError(null);
    try {
      const updatedPlan = await travelService.updatePlan(id, planData, shareToken);
      setPlans(prev => prev.map(p => p.id === id ? updatedPlan : p));
      if (currentPlan && currentPlan.id === id) {
        // preserve nested structures when updating basic info
        setCurrentPlan(new TravelPlan({
          ...updatedPlan,
          destinations: currentPlan.destinations,
          packingListItems: currentPlan.packingListItems,
          shares: currentPlan.shares
        }));
      }
      return updatedPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePlan = async (id) => {
    setError(null);
    try {
      await travelService.deletePlan(id);
      setPlans(prev => prev.filter(p => p.id !== id));
      if (currentPlan && currentPlan.id === id) {
        setCurrentPlan(null);
        setAccessLevel('NONE');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Destination operations
  const addDestination = async (planId, destData, shareToken = null) => {
    try {
      const newDest = await travelService.addDestination(planId, destData, shareToken);
      if (currentPlan && currentPlan.id === planId) {
        const updatedDestinations = [...currentPlan.destinations, newDest].sort(
          (a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate)
        );
        setCurrentPlan(new TravelPlan({
          ...currentPlan,
          destinations: updatedDestinations
        }));
      }
      return newDest;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateDestination = async (planId, destId, destData, shareToken = null) => {
    try {
      const updatedDest = await travelService.updateDestination(planId, destId, destData, shareToken);
      if (currentPlan && currentPlan.id === planId) {
        const updatedDestinations = currentPlan.destinations
          .map(d => d.id === destId ? updatedDest : d)
          .sort((a, b) => new Date(a.arrivalDate) - new Date(b.arrivalDate));

        setCurrentPlan(new TravelPlan({
          ...currentPlan,
          destinations: updatedDestinations
        }));
      }
      return updatedDest;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteDestination = async (planId, destId, shareToken = null) => {
    try {
      await travelService.deleteDestination(planId, destId, shareToken);
      if (currentPlan && currentPlan.id === planId) {
        setCurrentPlan(new TravelPlan({
          ...currentPlan,
          destinations: currentPlan.destinations.filter(d => d.id !== destId)
        }));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Packing list operations
  const addPackingItem = async (planId, itemData, shareToken = null) => {
    try {
      const newItem = await travelService.addPackingItem(planId, itemData, shareToken);
      if (currentPlan && currentPlan.id === planId) {
        setCurrentPlan(new TravelPlan({
          ...currentPlan,
          packingListItems: [...currentPlan.packingListItems, newItem]
        }));
      }
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePackingItem = async (planId, itemId, itemData, shareToken = null) => {
    try {
      const updatedItem = await travelService.updatePackingItem(planId, itemId, itemData, shareToken);
      if (currentPlan && currentPlan.id === planId) {
        setCurrentPlan(new TravelPlan({
          ...currentPlan,
          packingListItems: currentPlan.packingListItems.map(i => i.id === itemId ? updatedItem : i)
        }));
      }
      return updatedItem;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePackingItem = async (planId, itemId, shareToken = null) => {
    try {
      await travelService.deletePackingItem(planId, itemId, shareToken);
      if (currentPlan && currentPlan.id === planId) {
        setCurrentPlan(new TravelPlan({
          ...currentPlan,
          packingListItems: currentPlan.packingListItems.filter(i => i.id !== itemId)
        }));
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sharing
  const generateShareToken = async (planId, accessLevel) => {
    try {
      const share = await travelService.generateShareToken(planId, accessLevel);
      if (currentPlan && currentPlan.id === planId) {
        // Add or update share in current plan
        const exists = currentPlan.shares.some(s => s.id === share.id);
        const updatedShares = exists 
          ? currentPlan.shares.map(s => s.id === share.id ? share : s)
          : [...currentPlan.shares, share];
        setCurrentPlan(new TravelPlan({
          ...currentPlan,
          shares: updatedShares
        }));
      }
      return share;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchPlanByShareToken = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const { plan, accessLevel: level } = await travelService.getPlanByShareToken(token);
      setCurrentPlan(plan);
      setAccessLevel(level);
      return { plan, accessLevel: level };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TravelPlanContext.Provider value={{
      plans,
      currentPlan,
      accessLevel,
      loading,
      error,
      fetchPlans,
      fetchPlan,
      createPlan,
      updatePlan,
      deletePlan,
      addDestination,
      updateDestination,
      deleteDestination,
      addPackingItem,
      updatePackingItem,
      deletePackingItem,
      generateShareToken,
      fetchPlanByShareToken,
      travelService
    }}>
      {children}
    </TravelPlanContext.Provider>
  );
};

export const useTravelPlan = () => useContext(TravelPlanContext);
