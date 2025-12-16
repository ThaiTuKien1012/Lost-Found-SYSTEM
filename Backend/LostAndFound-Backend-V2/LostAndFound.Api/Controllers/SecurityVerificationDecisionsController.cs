using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SecurityVerificationDecisionsController : ControllerBase
    {
        private readonly ISecurityVerificationDecisionService _service;

        public SecurityVerificationDecisionsController(ISecurityVerificationDecisionService service)
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
            var decision = await _service.GetByIdAsync(id);
            if (decision == null) return NotFound();
            return Ok(decision);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SecurityVerificationDecisions decision)
        {
            // TODO: sau này dùng DTO + lấy security staff từ token
            var created = await _service.CreateAsync(decision);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] SecurityVerificationDecisions decision)
        {
            var updated = await _service.UpdateAsync(id, decision);
            if (updated == null) return NotFound();
            return Ok(updated);
        }
    }
}