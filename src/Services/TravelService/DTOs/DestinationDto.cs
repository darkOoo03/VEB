using System;
using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class DestinationDto
    {
        [Required(ErrorMessage = "Naziv destinacije je obavezan")]
        [StringLength(150, ErrorMessage = "Naziv ne može biti duži od 150 karaktera")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Lokacija je obavezna")]
        [StringLength(150, ErrorMessage = "Lokacija ne može biti duža od 150 karaktera")]
        public string Location { get; set; } = string.Empty;

        [Required(ErrorMessage = "Datum dolaska je obavezan")]
        public DateTime ArrivalDate { get; set; }

        [Required(ErrorMessage = "Datum odlaska je obavezan")]
        public DateTime DepartureDate { get; set; }

        [StringLength(500, ErrorMessage = "Opis ne može biti duži od 500 karaktera")]
        public string Notes { get; set; } = string.Empty;
    }
}
