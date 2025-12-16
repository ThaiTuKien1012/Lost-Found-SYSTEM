using LostAndFound.Application.DTOs;
﻿using LostAndFound.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace LostAndFound.Application.Interfaces
{
    public interface IStudentClaimService
    {
        // Methods from HEAD (entity-based)
        Task<IEnumerable<StudentClaims>> GetAllAsync();
        Task<StudentClaims?> GetByIdAsync(int id);
        Task<StudentClaims> CreateAsync(StudentClaims claim);
        Task<StudentClaims?> UpdateStatusAsync(int id, string status);
        
        // Methods from trunghqse170589- (DTO-based)
        Task<StudentClaimResponseDto> CreateClaimAsync(int studentId, StudentClaimCreateDto dto);
        Task<StudentClaimResponseDto?> GetClaimByIdAsync(int claimId);
        Task<IEnumerable<StudentClaimResponseDto>> GetMyClaimsAsync(int studentId);
        Task<bool> CancelClaimAsync(int claimId, int studentId);
        Task<bool> CheckItemAvailabilityAsync(int foundItemId);
    }
}