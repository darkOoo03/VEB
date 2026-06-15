using Microsoft.EntityFrameworkCore;
using TravelService.Models;

namespace TravelService.Data
{
    public class TravelDbContext : DbContext
    {
        public TravelDbContext(DbContextOptions<TravelDbContext> options) : base(options)
        {
        }

        public DbSet<TravelPlan> TravelPlans { get; set; }
        public DbSet<Destination> Destinations { get; set; }
        public DbSet<PackingListItem> PackingListItems { get; set; }
        public DbSet<TravelPlanShare> TravelPlanShares { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<TravelPlan>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Budget).HasColumnType("decimal(18,2)");
                
                entity.HasMany(e => e.Destinations)
                      .WithOne()
                      .HasForeignKey(d => d.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.PackingListItems)
                      .WithOne()
                      .HasForeignKey(i => i.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasMany(e => e.Shares)
                      .WithOne()
                      .HasForeignKey(s => s.TravelPlanId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Destination>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Location).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Notes).HasMaxLength(500);
            });

            modelBuilder.Entity<PackingListItem>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
            });

            modelBuilder.Entity<TravelPlanShare>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Token).IsRequired().HasMaxLength(100);
                entity.Property(e => e.AccessLevel).IsRequired().HasMaxLength(10);
            });
        }
    }
}
