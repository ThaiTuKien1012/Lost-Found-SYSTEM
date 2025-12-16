using System.Security.Claims;
using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/staff/claims")]
    [Authorize(Roles = "STAFF")]
    public class StaffClaimsController : ControllerBase
    {
        private readonly IStaffClaimService _claimService;

        public StaffClaimsController(IStaffClaimService claimService)
        {
            _claimService = claimService;
        }

        private int GetCurrentUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(idStr))
                throw new UnauthorizedAccessException("User id not found in token.");
            return int.Parse(idStr);
        }

        // GET api/staff/claims
        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] StaffClaimFilterDto filter)
        {
            var result = await _claimService.GetClaimsAsync(filter);
            return Ok(result);
        }

        // GET api/staff/claims/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var claim = await _claimService.GetClaimByIdAsync(id);
            if (claim == null) return NotFound();
            return Ok(claim);
        }

        // POST api/staff/claims/5/approve
        [HttpPost("{id:int}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] StaffClaimDecisionDto dto)
        {
            var staffId = GetCurrentUserId();
            await _claimService.ApproveClaimAsync(id, staffId, dto.Note);
            return NoContent();
        }

        // POST api/staff/claims/5/reject
        [HttpPost("{id:int}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] StaffClaimDecisionDto dto)
        {
            var staffId = GetCurrentUserId();
            await _claimService.RejectClaimAsync(id, staffId, dto.Note);
            return NoContent();
        }
    }
}
