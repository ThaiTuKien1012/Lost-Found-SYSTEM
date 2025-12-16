using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffReturnReceiptsController : ControllerBase
    {
        private readonly IStaffReturnReceiptService _service;

        public StaffReturnReceiptsController(IStaffReturnReceiptService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _service.GetAllAsync();
            return Ok(data);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var receipt = await _service.GetByIdAsync(id);
            if (receipt == null) return NotFound();
            return Ok(receipt);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StaffReturnReceipts receipt)
        {
            // TODO: sau này dùng DTO + lấy staff từ token
            var created = await _service.CreateAsync(receipt);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] StaffReturnReceipts receipt)
        {
            var updated = await _service.UpdateAsync(id, receipt);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
    }
}
