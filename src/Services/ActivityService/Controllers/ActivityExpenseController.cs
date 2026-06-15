using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ActivityService.Data;
using ActivityService.Models;
using ActivityService.DTOs;
using ActivityService.Services;
using ActivityService.State;

namespace ActivityService.Controllers
{
    [ApiController]
    [Route("api/travel-plans/{travelPlanId}")]
    [Authorize]
    public class ActivityExpenseController : ControllerBase
    {
        private readonly ActivityDbContext _context;
        private readonly IStatefulBudgetManager _budgetManager;

        public ActivityExpenseController(ActivityDbContext context, IStatefulBudgetManager budgetManager)
        {
            _context = context;
            _budgetManager = budgetManager;
        }

        // Helper to update the stateful budget cache
        private async Task UpdateBudgetCacheAsync(Guid travelPlanId, decimal plannedBudget)
        {
            var totalExpenses = await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .SumAsync(e => e.Amount);

            var totalActivityCosts = await _context.Activities
                .Where(a => a.TravelPlanId == travelPlanId)
                .SumAsync(a => a.EstimatedCost);

            await _budgetManager.UpdateBudgetStateAsync(travelPlanId, plannedBudget, totalExpenses, totalActivityCosts);
        }

        #region Activities Endpoints

        [HttpGet("activities")]
        public async Task<IActionResult> GetActivities(Guid travelPlanId)
        {
            var activities = await _context.Activities
                .Where(a => a.TravelPlanId == travelPlanId)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Time)
                .ToListAsync();

            return Ok(activities);
        }

        [HttpPost("activities")]
        public async Task<IActionResult> AddActivity(Guid travelPlanId, [FromBody] ActivityDto dto, [FromQuery] decimal plannedBudget = 0)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var activity = new Activity
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status,
                TravelPlanId = travelPlanId
            };

            _context.Activities.Add(activity);
            await _context.SaveChangesAsync();

            await UpdateBudgetCacheAsync(travelPlanId, plannedBudget);

            return Created("", activity);
        }

        [HttpPut("activities/{activityId}")]
        public async Task<IActionResult> UpdateActivity(Guid travelPlanId, Guid activityId, [FromBody] ActivityDto dto, [FromQuery] decimal plannedBudget = 0)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var activity = await _context.Activities
                .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == travelPlanId);

            if (activity == null)
                return NotFound(new { message = "Aktivnost nije pronađena." });

            activity.Name = dto.Name;
            activity.Date = dto.Date;
            activity.Time = dto.Time;
            activity.Location = dto.Location;
            activity.Description = dto.Description;
            activity.EstimatedCost = dto.EstimatedCost;
            activity.Status = dto.Status;

            await _context.SaveChangesAsync();

            await UpdateBudgetCacheAsync(travelPlanId, plannedBudget);

            return Ok(activity);
        }

        [HttpDelete("activities/{activityId}")]
        public async Task<IActionResult> DeleteActivity(Guid travelPlanId, Guid activityId, [FromQuery] decimal plannedBudget = 0)
        {
            var activity = await _context.Activities
                .FirstOrDefaultAsync(a => a.Id == activityId && a.TravelPlanId == travelPlanId);

            if (activity == null)
                return NotFound();

            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();

            await UpdateBudgetCacheAsync(travelPlanId, plannedBudget);

            return Ok(new { message = "Aktivnost je uspešno obrisana." });
        }

        #endregion

        #region Expenses Endpoints

        [HttpGet("expenses")]
        public async Task<IActionResult> GetExpenses(Guid travelPlanId)
        {
            var expenses = await _context.Expenses
                .Where(e => e.TravelPlanId == travelPlanId)
                .OrderBy(e => e.Date)
                .ToListAsync();

            return Ok(expenses);
        }

        [HttpPost("expenses")]
        public async Task<IActionResult> AddExpense(Guid travelPlanId, [FromBody] ExpenseDto dto, [FromQuery] decimal plannedBudget = 0)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var expense = new Expense
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description,
                TravelPlanId = travelPlanId
            };

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            await UpdateBudgetCacheAsync(travelPlanId, plannedBudget);

            return Created("", expense);
        }

        [HttpPut("expenses/{expenseId}")]
        public async Task<IActionResult> UpdateExpense(Guid travelPlanId, Guid expenseId, [FromBody] ExpenseDto dto, [FromQuery] decimal plannedBudget = 0)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == travelPlanId);

            if (expense == null)
                return NotFound(new { message = "Trošak nije pronađen." });

            expense.Name = dto.Name;
            expense.Category = dto.Category;
            expense.Amount = dto.Amount;
            expense.Date = dto.Date;
            expense.Description = dto.Description;

            await _context.SaveChangesAsync();

            await UpdateBudgetCacheAsync(travelPlanId, plannedBudget);

            return Ok(expense);
        }

        [HttpDelete("expenses/{expenseId}")]
        public async Task<IActionResult> DeleteExpense(Guid travelPlanId, Guid expenseId, [FromQuery] decimal plannedBudget = 0)
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == expenseId && e.TravelPlanId == travelPlanId);

            if (expense == null)
                return NotFound();

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            await UpdateBudgetCacheAsync(travelPlanId, plannedBudget);

            return Ok(new { message = "Trošak je uspešno obrisan." });
        }

        #endregion

        #region Budget Summary Endpoints

        [HttpGet("budget-summary")]
        public async Task<IActionResult> GetBudgetSummary(Guid travelPlanId, [FromQuery] decimal plannedBudget = 0)
        {
            // Try to get budget from stateful cache first
            var state = await _budgetManager.GetBudgetStateAsync(travelPlanId);

            if (state == null || state.PlannedBudget != plannedBudget)
            {
                // Cache miss or planned budget changed, recalculate and update cache
                await UpdateBudgetCacheAsync(travelPlanId, plannedBudget);
                state = await _budgetManager.GetBudgetStateAsync(travelPlanId);
            }

            if (state == null)
            {
                return Ok(new BudgetSummaryDto
                {
                    PlannedBudget = plannedBudget,
                    TotalExpenses = 0,
                    RemainingBudget = plannedBudget,
                    TotalEstimatedActivityCosts = 0
                });
            }

            return Ok(new BudgetSummaryDto
            {
                PlannedBudget = state.PlannedBudget,
                TotalExpenses = state.TotalExpenses,
                RemainingBudget = state.PlannedBudget - state.TotalExpenses,
                TotalEstimatedActivityCosts = state.TotalEstimatedActivityCosts
            });
        }

        #endregion
    }
}
