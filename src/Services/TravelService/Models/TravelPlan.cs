using System;
using System.Collections.Generic;

namespace TravelService.Models
{
    public class TravelPlan
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string Notes { get; set; } = string.Empty;
        public Guid UserId { get; set; } // Owner
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public List<Destination> Destinations { get; set; } = new List<Destination>();
        public List<PackingListItem> PackingListItems { get; set; } = new List<PackingListItem>();
        public List<TravelPlanShare> Shares { get; set; } = new List<TravelPlanShare>();
    }
}
