using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TravelService.Data;
using TravelService.Models;
using TravelService.DTOs;

namespace TravelService.Controllers
{
    [ApiController]
    [Route("api/travel-plans")]
    [Authorize]
    public class TravelPlanController : ControllerBase
    {
        private readonly TravelDbContext _context;

        public TravelPlanController(TravelDbContext context)
        {
            _context = context;
        }

        // Helper: gets current logged-in user information
        private (Guid UserId, string Role) GetUserInfo()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var role = User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
            Guid.TryParse(userIdStr, out var userId);
            return (userId, role);
        }

        // Helper: validates access level for a plan (combines JWT ownership and sharing token)
        private async Task<(bool Allowed, string AccessLevel)> ValidatePlanAccess(Guid planId, string? shareToken = null, bool isWrite = false)
        {
            var (userId, role) = GetUserInfo();

            // 1. If admin, full access
            if (role == "Admin")
                return (true, "EDIT");

            var plan = await _context.TravelPlans.AsNoTracking().FirstOrDefaultAsync(p => p.Id == planId);
            if (plan == null)
                return (false, "NONE");

            // 2. If owner, full access
            if (plan.UserId == userId)
                return (true, "EDIT");

            // 3. Check sharing token if provided
            if (!string.IsNullOrEmpty(shareToken))
            {
                var share = await _context.TravelPlanShares
                    .FirstOrDefaultAsync(s => s.TravelPlanId == planId && s.Token == shareToken);

                if (share != null)
                {
                    if (isWrite && share.AccessLevel != "EDIT")
                    {
                        return (false, "VIEW");
                    }
                    return (true, share.AccessLevel);
                }
            }

            return (false, "NONE");
        }

        #region Travel Plan Endpoints

        [HttpGet]
        public async Task<IActionResult> GetPlans([FromQuery] string? shareToken = null)
        {
            var (userId, role) = GetUserInfo();

            IQueryable<TravelPlan> query = _context.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.PackingListItems)
                .Include(p => p.Shares);

            if (role != "Admin")
            {
                // Return plans owned by user, OR if a shareToken is provided and valid, include that plan
                if (!string.IsNullOrEmpty(shareToken))
                {
                    var sharedPlanIds = await _context.TravelPlanShares
                        .Where(s => s.Token == shareToken)
                        .Select(s => s.TravelPlanId)
                        .ToListAsync();

                    query = query.Where(p => p.UserId == userId || sharedPlanIds.Contains(p.Id));
                }
                else
                {
                    query = query.Where(p => p.UserId == userId);
                }
            }

            var plans = await query.ToListAsync();

            var response = plans.Select(MapToResponseDto).ToList();
            return Ok(response);
        }

        [HttpGet("{id}")]
        [AllowAnonymous] // Allow anonymous access if viewing via sharing token
        public async Task<IActionResult> GetPlanById(Guid id, [FromQuery] string? shareToken = null)
        {
            var (allowed, accessLevel) = await ValidatePlanAccess(id, shareToken, isWrite: false);
            if (!allowed)
                return Unauthorized(new { message = "Nemate pravo pristupa ovom planu putovanja." });

            var plan = await _context.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.PackingListItems)
                .Include(p => p.Shares)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (plan == null)
                return NotFound(new { message = "Plan putovanja nije pronađen." });

            var dto = MapToResponseDto(plan);
            return Ok(new { plan = dto, accessLevel });
        }

        [HttpPost]
        public async Task<IActionResult> CreatePlan([FromBody] TravelPlanCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti pre početnog datuma." });

            var (userId, _) = GetUserInfo();

            var plan = new TravelPlan
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Budget = dto.Budget,
                Notes = dto.Notes,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.TravelPlans.Add(plan);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPlanById), new { id = plan.Id }, MapToResponseDto(plan));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] TravelPlanCreateDto dto, [FromQuery] string? shareToken = null)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za menjanje ovog plana." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (dto.EndDate < dto.StartDate)
                return BadRequest(new { message = "Krajnji datum ne može biti pre početnog datuma." });

            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null)
                return NotFound();

            plan.Name = dto.Name;
            plan.Description = dto.Description;
            plan.StartDate = dto.StartDate;
            plan.EndDate = dto.EndDate;
            plan.Budget = dto.Budget;
            plan.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return Ok(MapToResponseDto(plan));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePlan(Guid id)
        {
            var (userId, role) = GetUserInfo();
            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null)
                return NotFound();

            // Only owner or admin can delete plans
            if (role != "Admin" && plan.UserId != userId)
                return Unauthorized(new { message = "Samo vlasnik ili administrator mogu obrisati plan putovanja." });

            _context.TravelPlans.Remove(plan);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Plan putovanja je uspešno obrisan." });
        }

        #endregion

        #region Destination Endpoints

        [HttpPost("{id}/destinations")]
        public async Task<IActionResult> AddDestination(Guid id, [FromBody] DestinationDto dto, [FromQuery] string? shareToken = null)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za uređivanje ovog plana." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null)
                return NotFound(new { message = "Plan putovanja nije pronađen." });

            // Validate destination dates are within travel plan range
            if (dto.ArrivalDate < plan.StartDate || dto.DepartureDate > plan.EndDate)
                return BadRequest(new { message = $"Datumi destinacije moraju biti u okviru putovanja ({plan.StartDate:dd.MM.yyyy} - {plan.EndDate:dd.MM.yyyy})." });

            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti pre datuma dolaska." });

            var destination = new Destination
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Notes = dto.Notes,
                TravelPlanId = id
            };

            _context.Destinations.Add(destination);
            await _context.SaveChangesAsync();

            return Ok(MapToDestDto(destination));
        }

        [HttpPut("{id}/destinations/{destId}")]
        public async Task<IActionResult> UpdateDestination(Guid id, Guid destId, [FromBody] DestinationDto dto, [FromQuery] string? shareToken = null)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za uređivanje ovog plana." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null)
                return NotFound(new { message = "Plan putovanja nije pronađen." });

            if (dto.ArrivalDate < plan.StartDate || dto.DepartureDate > plan.EndDate)
                return BadRequest(new { message = $"Datumi destinacije moraju biti u okviru putovanja ({plan.StartDate:dd.MM.yyyy} - {plan.EndDate:dd.MM.yyyy})." });

            if (dto.DepartureDate < dto.ArrivalDate)
                return BadRequest(new { message = "Datum odlaska ne može biti pre datuma dolaska." });

            var dest = await _context.Destinations.FirstOrDefaultAsync(d => d.Id == destId && d.TravelPlanId == id);
            if (dest == null)
                return NotFound(new { message = "Destinacija nije pronađena." });

            dest.Name = dto.Name;
            dest.Location = dto.Location;
            dest.ArrivalDate = dto.ArrivalDate;
            dest.DepartureDate = dto.DepartureDate;
            dest.Notes = dto.Notes;

            await _context.SaveChangesAsync();
            return Ok(MapToDestDto(dest));
        }

        [HttpDelete("{id}/destinations/{destId}")]
        public async Task<IActionResult> DeleteDestination(Guid id, Guid destId, [FromQuery] string? shareToken = null)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za uređivanje ovog plana." });

            var dest = await _context.Destinations.FirstOrDefaultAsync(d => d.Id == destId && d.TravelPlanId == id);
            if (dest == null)
                return NotFound();

            _context.Destinations.Remove(dest);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Destinacija je obrisana." });
        }

        #endregion

        #region Packing List Endpoints

        [HttpPost("{id}/packing-list")]
        public async Task<IActionResult> AddPackingItem(Guid id, [FromBody] PackingListItemDto dto, [FromQuery] string? shareToken = null)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za uređivanje ovog plana." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var item = new PackingListItem
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                IsCompleted = dto.IsCompleted,
                TravelPlanId = id
            };

            _context.PackingListItems.Add(item);
            await _context.SaveChangesAsync();
            return Ok(MapToPackingDto(item));
        }

        [HttpPut("{id}/packing-list/{itemId}")]
        public async Task<IActionResult> UpdatePackingItem(Guid id, Guid itemId, [FromBody] PackingListItemDto dto, [FromQuery] string? shareToken = null)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za uređivanje ovog plana." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var item = await _context.PackingListItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TravelPlanId == id);
            if (item == null)
                return NotFound();

            item.Name = dto.Name;
            item.IsCompleted = dto.IsCompleted;

            await _context.SaveChangesAsync();
            return Ok(MapToPackingDto(item));
        }

        [HttpDelete("{id}/packing-list/{itemId}")]
        public async Task<IActionResult> DeletePackingItem(Guid id, Guid itemId, [FromQuery] string? shareToken = null)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za uređivanje ovog plana." });

            var item = await _context.PackingListItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TravelPlanId == id);
            if (item == null)
                return NotFound();

            _context.PackingListItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Stavka packing liste je obrisana." });
        }

        #endregion

        #region Sharing Endpoints

        [HttpPost("{id}/shares")]
        public async Task<IActionResult> GenerateShare(Guid id, [FromBody] ShareCreateDto dto)
        {
            var (allowed, _) = await ValidatePlanAccess(id, shareToken: null, isWrite: true);
            if (!allowed)
                return Unauthorized(new { message = "Nemate dozvolu za generisanje deljenja ovog plana." });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Check if there is already an active share token for this plan with this access level
            var existing = await _context.TravelPlanShares
                .FirstOrDefaultAsync(s => s.TravelPlanId == id && s.AccessLevel == dto.AccessLevel);

            if (existing != null)
            {
                return Ok(MapToShareDto(existing));
            }

            var share = new TravelPlanShare
            {
                Id = Guid.NewGuid(),
                Token = Guid.NewGuid().ToString("N"), // Use a random 32 character hex string
                AccessLevel = dto.AccessLevel,
                TravelPlanId = id,
                CreatedAt = DateTime.UtcNow
            };

            _context.TravelPlanShares.Add(share);
            await _context.SaveChangesAsync();

            return Ok(MapToShareDto(share));
        }

        [HttpGet("shares/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPlanByShareToken(string token)
        {
            var share = await _context.TravelPlanShares
                .FirstOrDefaultAsync(s => s.Token == token);

            if (share == null)
                return NotFound(new { message = "Token za deljenje nije validan ili je istekao." });

            var plan = await _context.TravelPlans
                .Include(p => p.Destinations)
                .Include(p => p.PackingListItems)
                .Include(p => p.Shares)
                .FirstOrDefaultAsync(p => p.Id == share.TravelPlanId);

            if (plan == null)
                return NotFound(new { message = "Plan putovanja više ne postoji." });

            var dto = MapToResponseDto(plan);
            return Ok(new { plan = dto, accessLevel = share.AccessLevel });
        }

        #endregion

        #region Map Helpers

        private TravelPlanResponseDto MapToResponseDto(TravelPlan plan)
        {
            return new TravelPlanResponseDto
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                Budget = plan.Budget,
                Notes = plan.Notes,
                UserId = plan.UserId,
                CreatedAt = plan.CreatedAt,
                Destinations = plan.Destinations.Select(MapToDestDto).ToList(),
                PackingListItems = plan.PackingListItems.Select(MapToPackingDto).ToList(),
                Shares = plan.Shares.Select(MapToShareDto).ToList()
            };
        }

        private DestinationResponseDto MapToDestDto(Destination d)
        {
            return new DestinationResponseDto
            {
                Id = d.Id,
                Name = d.Name,
                Location = d.Location,
                ArrivalDate = d.ArrivalDate,
                DepartureDate = d.DepartureDate,
                Notes = d.Notes,
                TravelPlanId = d.TravelPlanId
            };
        }

        private PackingListItemResponseDto MapToPackingDto(PackingListItem i)
        {
            return new PackingListItemResponseDto
            {
                Id = i.Id,
                Name = i.Name,
                IsCompleted = i.IsCompleted,
                TravelPlanId = i.TravelPlanId
            };
        }

        private ShareResponseDto MapToShareDto(TravelPlanShare s)
        {
            return new ShareResponseDto
            {
                Id = s.Id,
                Token = s.Token,
                AccessLevel = s.AccessLevel,
                TravelPlanId = s.TravelPlanId,
                CreatedAt = s.CreatedAt
            };
        }

        #endregion
    }
}
