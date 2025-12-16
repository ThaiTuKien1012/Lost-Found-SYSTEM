using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LostAndFound.Api.Controllers
{
    [ApiController]
    [Route("api/staff/lost-reports")]
    [Authorize(Roles = "STAFF")]
    public class StaffLostReportsController : ControllerBase
    {
        private readonly IStaffLostReportReadService _lostReportService;

        public StaffLostReportsController(IStaffLostReportReadService lostReportService)
        {
            _lostReportService = lostReportService;
        }

        // GET api/staff/lost-reports
        [HttpGet]
        public async Task<IActionResult> GetList([FromQuery] int? campusId, [FromQuery] int? itemCategoryId)
        {
            var result = await _lostReportService.GetListAsync(campusId, itemCategoryId);
            return Ok(result);
        }

        // GET api/staff/lost-reports/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var report = await _lostReportService.GetByIdAsync(id);
            if (report == null) return NotFound();
            return Ok(report);
        }
    }
}
