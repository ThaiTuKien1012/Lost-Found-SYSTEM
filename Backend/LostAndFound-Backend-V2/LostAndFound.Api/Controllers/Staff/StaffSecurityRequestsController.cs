using System.Security.Claims;
using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/staff/security-requests")]
    [Authorize(Roles = "STAFF")]
    public class StaffSecurityRequestsController : ControllerBase
    {
        private readonly IStaffSecurityRequestService _service;

        public StaffSecurityRequestsController(IStaffSecurityRequestService service)
        {
            _service = service;
        }

        private int StaffId
        {
            get
            {
                var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(idStr))
                    throw new UnauthorizedAccessException("User id not found in token.");
                return int.Parse(idStr);
            }
        }

        // POST api/staff/security-requests
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StaffSecurityRequestCreateDto dto)
        {
            var result = await _service.CreateSecurityRequestAsync(dto, StaffId);
            return Ok(result);
        }
    }
}
