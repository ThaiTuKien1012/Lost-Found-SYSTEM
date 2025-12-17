using LostAndFound.Application.DTOs;
using LostAndFound.Application.Interfaces;
using LostAndFound.Domain.Entities;
using LostAndFound.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Services
{
    public class StudentLostReportService : IStudentLostReportService
    {
        private readonly LostAndFoundDbContext _db;

        public StudentLostReportService(LostAndFoundDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<StudentLostReports>> GetAllAsync()
        {
            return await _db.StudentLostReports.AsNoTracking().ToListAsync();
        }

        public async Task<StudentLostReports?> GetByIdAsync(int id)
        {
            return await _db.StudentLostReports.FindAsync(id);
        }

        public async Task<StudentLostReports> CreateAsync(StudentLostReports report)
        {
            report.CreatedAt = DateTime.UtcNow;
            report.UpdatedAt = DateTime.UtcNow;
            report.Status = "PENDING";

            _db.StudentLostReports.Add(report);
            await _db.SaveChangesAsync();
            return report;
        }

        public async Task<StudentLostReports?> UpdateStatusAsync(int id, string status)
        {
            var report = await _db.StudentLostReports.FindAsync(id);
            if (report == null) return null;

            report.Status = status;
            report.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return report;
        }

        public async Task<IEnumerable<StudentLostReportResponseDto>> GetByStudentIdAsync(int studentId)
        {
            return await _db.StudentLostReports
                .AsNoTracking()
                .Where(r => r.StudentId == studentId)
                .Include(r => r.Campus)
                .Include(r => r.ItemCategory)
                .Include(r => r.Student)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new StudentLostReportResponseDto
                {
                    Id = r.Id,
                    StudentId = r.StudentId,
                    StudentName = r.Student.FullName,
                    CampusId = r.CampusId,
                    CampusName = r.Campus.Name,
                    ItemCategoryId = r.ItemCategoryId,
                    ItemCategoryName = r.ItemCategory.Name,
                    Title = r.Title,
                    Description = r.Description,
                    LostTime = r.LostTime,
                    LostLocation = r.LostLocation,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    ImageUrl = r.ImageUrl // ← THÊM DÒNG MỚI
                })
                .ToListAsync();
        }

        public async Task<StudentLostReportResponseDto> CreateFromDtoAsync(int studentId, StudentLostReportCreateDto dto)
        {
            var report = new StudentLostReports
            {
                StudentId = studentId,
                CampusId = dto.CampusId,
                ItemCategoryId = dto.ItemCategoryId,
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                LostTime = dto.LostTime,
                LostLocation = dto.LostLocation?.Trim(),
                ImageUrl = dto.ImageUrl?.Trim(), // ← THÊM DÒNG MỚI
                Status = "PENDING",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.StudentLostReports.Add(report);
            await _db.SaveChangesAsync();

            // Reload với navigation properties
            var created = await _db.StudentLostReports
                .Include(r => r.Campus)
                .Include(r => r.ItemCategory)
                .Include(r => r.Student)
                .FirstAsync(r => r.Id == report.Id);

            if (created.Student == null)
                throw new InvalidOperationException($"Student with ID {studentId} not found");
            if (created.Campus == null)
                throw new InvalidOperationException($"Campus with ID {dto.CampusId} not found");
            if (created.ItemCategory == null)
                throw new InvalidOperationException($"ItemCategory with ID {dto.ItemCategoryId} not found");

            return new StudentLostReportResponseDto
            {
                Id = created.Id,
                StudentId = created.StudentId,
                StudentName = created.Student.FullName ?? "N/A",
                CampusId = created.CampusId,
                CampusName = created.Campus.Name ?? "N/A",
                ItemCategoryId = created.ItemCategoryId,
                ItemCategoryName = created.ItemCategory.Name ?? "N/A",
                Title = created.Title,
                Description = created.Description,
                LostTime = created.LostTime,
                LostLocation = created.LostLocation,
                Status = created.Status,
                CreatedAt = created.CreatedAt,
                UpdatedAt = created.UpdatedAt,
                ImageUrl = created.ImageUrl
            };
        }

        public async Task<StudentLostReportResponseDto?> GetByIdWithDetailsAsync(int id)
        {
            return await _db.StudentLostReports
                .AsNoTracking()
                .Where(r => r.Id == id)
                .Include(r => r.Campus)
                .Include(r => r.ItemCategory)
                .Include(r => r.Student)
                .Select(r => new StudentLostReportResponseDto
                {
                    Id = r.Id,
                    StudentId = r.StudentId,
                    StudentName = r.Student.FullName,
                    CampusId = r.CampusId,
                    CampusName = r.Campus.Name,
                    ItemCategoryId = r.ItemCategoryId,
                    ItemCategoryName = r.ItemCategory.Name,
                    Title = r.Title,
                    Description = r.Description,
                    LostTime = r.LostTime,
                    LostLocation = r.LostLocation,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    ImageUrl = r.ImageUrl // ← THÊM DÒNG MỚI
                })
                .FirstOrDefaultAsync();
        }
    }
}
