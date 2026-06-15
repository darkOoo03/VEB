namespace Shared.Models
{
    public class AuthSettings
    {
        public string Secret { get; set; } = "SuperSecretKeyTravelPlanner2026!WithMinimumLengthRequirement";
        public string Issuer { get; set; } = "TravelPlannerAuthService";
        public string Audience { get; set; } = "TravelPlannerApp";
        public int ExpiryMinutes { get; set; } = 1440; // 24 hours
    }
}
