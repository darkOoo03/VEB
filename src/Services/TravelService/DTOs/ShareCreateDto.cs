using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class ShareCreateDto
    {
        [Required(ErrorMessage = "Nivo pristupa je obavezan")]
        [RegularExpression("^(VIEW|EDIT)$", ErrorMessage = "Nivo pristupa mora biti VIEW ili EDIT")]
        public string AccessLevel { get; set; } = "VIEW";
    }
}
