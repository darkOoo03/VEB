using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using ActivityService.State;

namespace ActivityService.Services
{
    public class InMemoryBudgetManager : IStatefulBudgetManager
    {
        private readonly ConcurrentDictionary<Guid, BudgetState> _cache = new ConcurrentDictionary<Guid, BudgetState>();

        public Task UpdateBudgetStateAsync(Guid travelPlanId, decimal plannedBudget, decimal totalExpenses, decimal totalActivityCosts)
        {
            var state = new BudgetState
            {
                TravelPlanId = travelPlanId,
                PlannedBudget = plannedBudget,
                TotalExpenses = totalExpenses,
                TotalEstimatedActivityCosts = totalActivityCosts
            };

            _cache.AddOrUpdate(travelPlanId, state, (key, oldVal) => state);
            return Task.CompletedTask;
        }

        public Task<BudgetState?> GetBudgetStateAsync(Guid travelPlanId)
        {
            _cache.TryGetValue(travelPlanId, out var state);
            return Task.FromResult<BudgetState?>(state);
        }
    }
}
