using System;
using System.ComponentModel.DataAnnotations;

namespace ActivityService.DTOs
{
    public class ActivityDto
    {
        [Required(ErrorMessage = "Naziv aktivnosti je obavezan")]
        [StringLength(150, ErrorMessage = "Naziv ne može biti duži od 150 karaktera")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Datum je obavezan")]
        public DateTime Date { get; set; }

        [StringLength(10, ErrorMessage = "Vreme ne može biti duže od 10 karaktera")]
        public string Time { get; set; } = string.Empty;

        [StringLength(150, ErrorMessage = "Lokacija ne može biti duža od 150 karaktera")]
        public string Location { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Opis ne može biti duži od 500 karaktera")]
        public string Description { get; set; } = string.Empty;

        [Range(0, double.MaxValue, ErrorMessage = "Procenjeni trošak ne može biti negativan")]
        public decimal EstimatedCost { get; set; }

        [Required(ErrorMessage = "Status je obavezan")]
        [RegularExpression("^(planirano|rezervisano|završeno|otkazano)$", ErrorMessage = "Status mora biti: planirano, rezervisano, završeno ili otkazano")]
        public string Status { get; set; } = "planirano";
    }
}
