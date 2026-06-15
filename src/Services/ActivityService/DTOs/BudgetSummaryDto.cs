namespace ActivityService.DTOs
{
    public class BudgetSummaryDto
    {
        public decimal PlannedBudget { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal RemainingBudget { get; set; }
        public decimal TotalEstimatedActivityCosts { get; set; }
    }
}
