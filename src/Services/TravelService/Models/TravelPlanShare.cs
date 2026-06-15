using System;

namespace TravelService.Models
{
    public class TravelPlanShare
    {
        public Guid Id { get; set; }
        public string Token { get; set; } = string.Empty; // UUID or secret token
        public string AccessLevel { get; set; } = "VIEW"; // VIEW or EDIT
        public Guid TravelPlanId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
