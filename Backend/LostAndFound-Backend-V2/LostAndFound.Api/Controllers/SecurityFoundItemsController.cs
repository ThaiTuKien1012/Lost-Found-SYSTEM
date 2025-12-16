using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Linq;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/security/found-items")]
    [Authorize(Roles = "SECURITY")]
    public class SecurityFoundItemsController : ControllerBase
    {
        private readonly ISecurityService _securityService;
        private readonly IFileUploadService _fileUploadService;

        public SecurityFoundItemsController(
            ISecurityService securityService,
            IFileUploadService fileUploadService)
        {
            _securityService = securityService;
            _fileUploadService = fileUploadService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreateFoundItem([FromForm] CreateSecurityFoundItemDto dto)
        {
            try
            {
                // Get SecurityId from JWT token
                var securityIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(securityIdClaim) || !int.TryParse(securityIdClaim, out int securityId))
                {
                    return Unauthorized(new { message = "Không thể xác định thông tin người dùng" });
                }

                // Validate required fields
                if (dto.CampusId <= 0)
                {
                    return BadRequest(new { message = "CampusId là bắt buộc và phải lớn hơn 0" });
                }

                if (dto.ItemCategoryId <= 0)
                {
                    return BadRequest(new { message = "ItemCategoryId là bắt buộc và phải lớn hơn 0" });
                }

                if (string.IsNullOrWhiteSpace(dto.FoundLocation))
                {
                    return BadRequest(new { message = "FoundLocation là bắt buộc" });
                }

                // Get image file from form
                IFormFile? image = null;
                if (Request.Form.Files != null && Request.Form.Files.Count > 0)
                {
                    image = Request.Form.Files["image"];
                    if (image == null && Request.Form.Files.Count > 0)
                    {
                        // If no "image" field, take first file
                        image = Request.Form.Files[0];
                    }
                }

                // Upload image if provided
                string? imageUrl = null;
                if (image != null && image.Length > 0)
                {
                    imageUrl = await _fileUploadService.UploadImageAsync(image, "security-found-items");
                    if (imageUrl == null)
                    {
                        return BadRequest(new { message = "Lỗi khi upload ảnh. Vui lòng kiểm tra định dạng và kích thước file (tối đa 5MB, định dạng: jpg, jpeg, png, gif, webp)" });
                    }
                }

                // Create found item
                var createdItem = await _securityService.CreateFoundItemAsync(dto, securityId, imageUrl);

                if (createdItem == null)
                {
                    return BadRequest(new { message = "Không thể tạo FoundItem. Vui lòng kiểm tra CampusId, ItemCategoryId và quyền truy cập" });
                }

                // Cloudinary returns full URL, so use it directly
                var fullImageUrl = createdItem.ImageUrl;

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = createdItem.Id },
                    new
                    {
                        id = createdItem.Id,
                        campusId = createdItem.CampusId,
                        itemCategoryId = createdItem.ItemCategoryId,
                        securityId = createdItem.SecurityId,
                        description = createdItem.Description,
                        foundTime = createdItem.FoundTime,
                        foundLocation = createdItem.FoundLocation,
                        status = createdItem.Status,
                        imageUrl = fullImageUrl,
                        createdAt = createdItem.CreatedAt,
                        updatedAt = createdItem.UpdatedAt
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi tạo FoundItem", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetFoundItemsByStatus([FromQuery] string? status = "AtSecurity")
        {
            try
            {
                var items = await _securityService.GetFoundItemsByStatusAsync(status ?? "AtSecurity");

                // Cloudinary returns full URL directly
                var result = items.Select(item => new SecurityFoundItemResponseDto
                {
                    Id = item.Id,
                    CampusId = item.CampusId,
                    CampusName = item.Campus?.Name,
                    ItemCategoryId = item.ItemCategoryId,
                    ItemCategoryName = item.ItemCategory?.Name,
                    SecurityId = item.SecurityId,
                    SecurityName = item.Security?.FullName,
                    Description = item.Description,
                    FoundTime = item.FoundTime,
                    FoundLocation = item.FoundLocation,
                    Status = item.Status,
                    ImageUrl = item.ImageUrl, // Cloudinary returns full URL
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi lấy danh sách FoundItems", error = ex.Message });
            }
        }

        [HttpGet("my-items")]
        public async Task<IActionResult> GetMyFoundItems()
        {
            try
            {
                // Get SecurityId from JWT token
                var securityIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(securityIdClaim) || !int.TryParse(securityIdClaim, out int securityId))
                {
                    return Unauthorized(new { message = "Không thể xác định thông tin người dùng" });
                }

                var items = await _securityService.GetMyFoundItemsAsync(securityId);

                // Cloudinary returns full URL directly
                var result = items.Select(item => new SecurityFoundItemResponseDto
                {
                    Id = item.Id,
                    CampusId = item.CampusId,
                    CampusName = item.Campus?.Name,
                    ItemCategoryId = item.ItemCategoryId,
                    ItemCategoryName = item.ItemCategory?.Name,
                    SecurityId = item.SecurityId,
                    SecurityName = item.Security?.FullName,
                    Description = item.Description,
                    FoundTime = item.FoundTime,
                    FoundLocation = item.FoundLocation,
                    Status = item.Status,
                    ImageUrl = item.ImageUrl, // Cloudinary returns full URL
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi lấy danh sách FoundItems của bạn", error = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var item = await _securityService.GetFoundItemByIdAsync(id);

                if (item == null)
                {
                    return NotFound(new { message = "Không tìm thấy FoundItem với ID này" });
                }

                // Cloudinary returns full URL directly
                var fullImageUrl = item.ImageUrl;

                return Ok(new
                {
                    id = item.Id,
                    campusId = item.CampusId,
                    campusName = item.Campus?.Name,
                    itemCategoryId = item.ItemCategoryId,
                    itemCategoryName = item.ItemCategory?.Name,
                    securityId = item.SecurityId,
                    securityName = item.Security?.FullName,
                    description = item.Description,
                    foundTime = item.FoundTime,
                    foundLocation = item.FoundLocation,
                    status = item.Status,
                    imageUrl = fullImageUrl,
                    createdAt = item.CreatedAt,
                    updatedAt = item.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi lấy thông tin FoundItem", error = ex.Message });
            }
        }
    }
}

