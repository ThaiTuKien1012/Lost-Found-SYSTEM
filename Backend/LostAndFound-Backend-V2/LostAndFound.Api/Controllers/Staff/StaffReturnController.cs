using System.Security.Claims;
using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/staff/return")]
    [Authorize(Roles = "STAFF")]
    public class StaffReturnController : ControllerBase
    {
        private readonly IStaffReturnService _returnService;

        public StaffReturnController(IStaffReturnService returnService)
        {
            _returnService = returnService;
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

        // POST api/staff/return
        [HttpPost]
        public async Task<IActionResult> ReturnItem([FromBody] StaffReturnItemCreateDto dto)
        {
            var receipt = await _returnService.CreateReturnReceiptAsync(dto, StaffId);
            return Ok(receipt);
        }
    }
}
