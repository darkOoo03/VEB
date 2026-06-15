using System;

namespace ActivityService.Models
{
    public class Expense
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Category { get; set; } = "ostalo"; // prevoz, smještaj, hrana, ulaznice, kupovina, ostalo
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public Guid TravelPlanId { get; set; }
    }
}
