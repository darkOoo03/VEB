using System;
using System.ComponentModel.DataAnnotations;

namespace ActivityService.DTOs
{
    public class ExpenseDto
    {
        [Required(ErrorMessage = "Naziv troška je obavezan")]
        [StringLength(150, ErrorMessage = "Naziv ne može biti duži od 150 karaktera")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Kategorija je obavezna")]
        [RegularExpression("^(prevoz|smještaj|hrana|ulaznice|kupovina|ostalo)$", ErrorMessage = "Kategorija mora biti: prevoz, smještaj, hrana, ulaznice, kupovina ili ostalo")]
        public string Category { get; set; } = "ostalo";

        [Range(0.01, double.MaxValue, ErrorMessage = "Iznos troška mora biti veći od nule")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Datum je obavezan")]
        public DateTime Date { get; set; }

        [StringLength(500, ErrorMessage = "Opis ne može biti duži od 500 karaktera")]
        public string Description { get; set; } = string.Empty;
    }
}
