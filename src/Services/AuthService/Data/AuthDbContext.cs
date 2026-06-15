using Microsoft.EntityFrameworkCore;
using AuthService.Models;
using Shared.Models;
using System;

namespace AuthService.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.Role).HasConversion<string>().IsRequired();
            });

            // Seed admin account
            var adminId = Guid.Parse("a518fb55-ebd2-4c84-8a94-3df444e271ee");
            // BCrypt hash of "adminpassword"
            var adminPasswordHash = "$2a$11$54kD3G5vPPeXpgOE/oNQj.UGBbKT/fbZtUXJvCeWmQDfch5EYSi1a";

            modelBuilder.Entity<User>().HasData(new User
            {
                Id = adminId,
                Name = "System Administrator",
                Email = "admin@travelplanner.com",
                PasswordHash = adminPasswordHash,
                Role = UserRole.Admin,
                CreatedAt = DateTime.Parse("2026-01-01T00:00:00Z").ToUniversalTime()
            });
        }
    }
}
