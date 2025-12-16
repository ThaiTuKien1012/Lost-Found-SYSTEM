using System.Security.Claims;
using LostAndFound.Application.Dtos.Staff;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StaffFoundItemFilterDto = LostAndFound.Application.Dtos.Staff.StaffFoundItemFilterDto;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/staff/found-items")]
    [Authorize(Roles = "STAFF")]
    public class StaffFoundItemsController : ControllerBase
    {
        private readonly IStaffFoundItemService _foundItemService;

        public StaffFoundItemsController(IStaffFoundItemService foundItemService)
        {
            _foundItemService = foundItemService;
        }

        private int GetCurrentUserId()
        {
            var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(idStr))
                throw new UnauthorizedAccessException("User id not found in token.");
            return int.Parse(idStr);
        }

        // GET api/staff/found-items
        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] LostAndFound.Application.Dtos.Staff.StaffFoundItemFilterDto filter)
        {
            var result = await _foundItemService.GetListAsync(filter);
            return Ok(result);
        }

        // GET api/staff/found-items/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _foundItemService.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        // POST api/staff/found-items/receive-from-security
        [HttpPost("receive-from-security")]
        public async Task<IActionResult> ReceiveFromSecurity([FromBody] StaffReceiveFoundItemDto dto)
        {
            var staffId = GetCurrentUserId();
            var result = await _foundItemService.ReceiveFromSecurityAsync(dto, staffId);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // PUT api/staff/found-items/5
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] StaffFoundItemUpdateDto dto)
        {
            var staffId = GetCurrentUserId();
            var result = await _foundItemService.UpdateAsync(id, dto, staffId);
            return Ok(result);
        }

        // POST api/staff/found-items/5/image
        [HttpPost("{id:int}/image")]
        public async Task<IActionResult> UploadImage(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty.");

            // TODO: upload file thật (local, S3, Cloudinary, …) -> imageUrl
            // Tạm fake url để backend compile được
            var imageUrl = $"https://example.com/images/{Guid.NewGuid()}.jpg";

            var staffId = GetCurrentUserId();
            await _foundItemService.UpdateImageUrlAsync(id, imageUrl, staffId);

            return Ok(new { imageUrl });
        }
    }
}
