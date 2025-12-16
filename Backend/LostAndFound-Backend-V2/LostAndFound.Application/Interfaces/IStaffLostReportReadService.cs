using LostAndFound.Application.DTOs;
using LostAndFound.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface IStaffLostReportReadService
    {
        Task<IList<StudentLostReports>> GetListAsync(int? campusId, int? itemCategoryId);
        Task<StudentLostReports?> GetByIdAsync(int id);
    }
}
