using System;

namespace TravelService.Models
{
    public class PackingListItem
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
        public Guid TravelPlanId { get; set; }
    }
}
