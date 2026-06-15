using System;
using System.Threading.Tasks;
using ActivityService.State;

namespace ActivityService.Services
{
    public interface IStatefulBudgetManager
    {
        Task UpdateBudgetStateAsync(Guid travelPlanId, decimal plannedBudget, decimal totalExpenses, decimal totalActivityCosts);
        Task<BudgetState?> GetBudgetStateAsync(Guid travelPlanId);
    }
}
