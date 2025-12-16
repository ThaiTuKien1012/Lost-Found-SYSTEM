using Microsoft.AspNetCore.Http;

namespace LostAndFound.Application.Interfaces
{
    public interface IFileUploadService
    {
        Task<string?> UploadImageAsync(IFormFile file, string subfolder);
        Task<bool> DeleteImageAsync(string imageUrl);
    }
}

