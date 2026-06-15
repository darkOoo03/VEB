using System;

namespace ActivityService.Models
{
    public class Activity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Time { get; set; } = string.Empty; // HH:mm format
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public string Status { get; set; } = "planirano"; // planirano, rezervisano, završeno, otkazano
        public Guid TravelPlanId { get; set; }
    }
}
