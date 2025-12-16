using LostAndFound.Application.DTOs;
using LostAndFound.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface IStudentLostReportService
    {
        Task<IEnumerable<StudentLostReports>> GetAllAsync();
        Task<StudentLostReports?> GetByIdAsync(int id);
        Task<StudentLostReports> CreateAsync(StudentLostReports report);
        Task<StudentLostReports?> UpdateStatusAsync(int id, string status);
        
        // ➕ THÊM MỚI
        Task<IEnumerable<StudentLostReportResponseDto>> GetByStudentIdAsync(int studentId);
        Task<StudentLostReportResponseDto> CreateFromDtoAsync(int studentId, StudentLostReportCreateDto dto);
        Task<StudentLostReportResponseDto?> GetByIdWithDetailsAsync(int id);
    }
}

