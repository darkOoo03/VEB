using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class PackingListItemDto
    {
        [Required(ErrorMessage = "Naziv stavke je obavezan")]
        [StringLength(150, ErrorMessage = "Naziv ne može biti duži od 150 karaktera")]
        public string Name { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
    }
}
