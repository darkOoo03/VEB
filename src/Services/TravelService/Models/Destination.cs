using System;

namespace TravelService.Models
{
    public class Destination
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public Guid TravelPlanId { get; set; }
    }
}
