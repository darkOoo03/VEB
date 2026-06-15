using System;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using ActivityService.State;

namespace ActivityService.Services
{
    public class ServiceFabricBudgetManager : IStatefulBudgetManager
    {
        private readonly IReliableStateManager _stateManager;
        private const string DictionaryName = "budgetStateDictionary";

        public ServiceFabricBudgetManager(IReliableStateManager stateManager)
        {
            _stateManager = stateManager;
        }

        public async Task UpdateBudgetStateAsync(Guid travelPlanId, decimal plannedBudget, decimal totalExpenses, decimal totalActivityCosts)
        {
            var budgetDict = await _stateManager.GetOrAddAsync<IReliableDictionary<Guid, BudgetState>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var state = new BudgetState
                {
                    TravelPlanId = travelPlanId,
                    PlannedBudget = plannedBudget,
                    TotalExpenses = totalExpenses,
                    TotalEstimatedActivityCosts = totalActivityCosts
                };

                await budgetDict.AddOrUpdateAsync(tx, travelPlanId, state, (key, value) => state);
                await tx.CommitAsync();
            }
        }

        public async Task<BudgetState?> GetBudgetStateAsync(Guid travelPlanId)
        {
            var budgetDict = await _stateManager.GetOrAddAsync<IReliableDictionary<Guid, BudgetState>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var result = await budgetDict.TryGetValueAsync(tx, travelPlanId);
                if (result.HasValue)
                {
                    return result.Value;
                }
            }

            return null;
        }
    }
}
