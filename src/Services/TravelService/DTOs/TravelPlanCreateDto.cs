using System;
using System.ComponentModel.DataAnnotations;

namespace TravelService.DTOs
{
    public class TravelPlanCreateDto
    {
        [Required(ErrorMessage = "Naziv putovanja je obavezan")]
        [StringLength(150, ErrorMessage = "Naziv ne može biti duži od 150 karaktera")]
        public string Name { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Opis ne može biti duži od 500 karaktera")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Početni datum je obavezan")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "Krajnji datum je obavezan")]
        public DateTime EndDate { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Budžet ne može biti negativan")]
        public decimal Budget { get; set; }

        [StringLength(1000, ErrorMessage = "Napomene ne mogu biti duže od 1000 karaktera")]
        public string Notes { get; set; } = string.Empty;
    }
}
