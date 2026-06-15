using System;

namespace ActivityService.State
{
    public class BudgetState
    {
        public Guid TravelPlanId { get; set; }
        public decimal PlannedBudget { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal TotalEstimatedActivityCosts { get; set; }
    }
}
