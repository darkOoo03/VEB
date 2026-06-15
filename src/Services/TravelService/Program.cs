using System;
using System.Text;
using System.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TravelService.Data;
using Shared.Models;
using Shared.Helpers;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            try
            {
                if (ServiceFabricHelper.IsRunningInServiceFabric())
                {
                    RunServiceFabric(args);
                }
                else
                {
                    RunStandalone(args);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Service startup failed: {ex}");
                throw;
            }
        }

        private static void RunStandalone(string[] args)
        {
            Console.WriteLine("Starting TravelService in Standalone mode...");
            var builder = WebApplication.CreateBuilder(args);
            ConfigureServices(builder.Services, builder.Configuration);

            var app = builder.Build();

            // Run DB Migrations programmatically on startup
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<TravelDbContext>();
                dbContext.Database.Migrate();
            }

            ConfigurePipeline(app);
            app.Run();
        }

        private static void RunServiceFabric(string[] args)
        {
            ServiceRuntime.RegisterServiceAsync("TravelServiceType",
                context => new ServiceFabricTravelService(context)).GetAwaiter().GetResult();

            Console.WriteLine("TravelServiceType registered with Service Fabric runtime.");
            Thread.Sleep(Timeout.Infinite);
        }

        public static void ConfigureServices(IServiceCollection services, IConfiguration configuration)
        {
            // Auth Settings
            var authSettings = new AuthSettings();
            services.AddSingleton(authSettings);

            // DB Context
            var connectionString = configuration.GetConnectionString("DefaultConnection") 
                ?? "Server=(localdb)\\MSSQLLocalDB;Database=TravelPlanner_Travel;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True;";
            services.AddDbContext<TravelDbContext>(options =>
                options.UseSqlServer(connectionString));

            // Authentication & JWT Authorization
            var key = Encoding.ASCII.GetBytes(authSettings.Secret);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = authSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = authSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            // Cors
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader();
                });
            });

            services.AddControllers();
            services.AddEndpointsApiExplorer();
        }

        public static void ConfigurePipeline(WebApplication app)
        {
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();
        }
    }
}
