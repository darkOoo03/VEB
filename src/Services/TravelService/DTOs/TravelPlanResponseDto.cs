using System;
using System.Collections.Generic;

namespace TravelService.DTOs
{
    public class TravelPlanResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal Budget { get; set; }
        public string Notes { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<DestinationResponseDto> Destinations { get; set; } = new List<DestinationResponseDto>();
        public List<PackingListItemResponseDto> PackingListItems { get; set; } = new List<PackingListItemResponseDto>();
        public List<ShareResponseDto> Shares { get; set; } = new List<ShareResponseDto>();
    }

    public class DestinationResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public Guid TravelPlanId { get; set; }
    }

    public class PackingListItemResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public Guid TravelPlanId { get; set; }
    }

    public class ShareResponseDto
    {
        public Guid Id { get; set; }
        public string Token { get; set; } = string.Empty;
        public string AccessLevel { get; set; } = "VIEW";
        public Guid TravelPlanId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
