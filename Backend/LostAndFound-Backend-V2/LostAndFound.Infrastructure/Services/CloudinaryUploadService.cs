using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using LostAndFound.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace LostAndFound.Infrastructure.Services
{
    public class CloudinaryUploadService : IFileUploadService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryUploadService> _logger;

        public CloudinaryUploadService(
            string cloudName,
            string apiKey,
            string apiSecret,
            ILogger<CloudinaryUploadService> logger)
        {
            _logger = logger;
            
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string?> UploadImageAsync(IFormFile file, string subfolder)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return null;
                }

                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    _logger.LogWarning("Invalid file extension: {Extension}", fileExtension);
                    return null;
                }

                // Validate file size (max 5MB)
                const long maxFileSize = 5 * 1024 * 1024; // 5MB
                if (file.Length > maxFileSize)
                {
                    _logger.LogWarning("File size exceeds limit: {Size} bytes", file.Length);
                    return null;
                }

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var publicId = $"lost-and-found/{subfolder}/{fileName}";

                // Upload to Cloudinary
                using (var stream = file.OpenReadStream())
                {
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(fileName, stream),
                        PublicId = publicId,
                        Folder = $"lost-and-found/{subfolder}",
                        Overwrite = false
                    };

                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                    if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
                    {
                        // Return the secure URL
                        return uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString();
                    }
                    else
                    {
                        _logger.LogError("Cloudinary upload failed: {Error}", uploadResult.Error?.Message);
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading image to Cloudinary");
                return null;
            }
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(imageUrl))
                {
                    return false;
                }

                // Extract public_id from Cloudinary URL
                // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
                var uri = new Uri(imageUrl);
                var segments = uri.Segments;
                
                // Find the index of "upload" segment
                var uploadIndex = Array.IndexOf(segments, "upload/");
                if (uploadIndex == -1)
                {
                    _logger.LogWarning("Invalid Cloudinary URL format: {Url}", imageUrl);
                    return false;
                }

                // Extract public_id (everything after upload/)
                var publicIdWithVersion = string.Join("", segments.Skip(uploadIndex + 1));
                
                // Remove version if present (format: v1234567890/public_id.format)
                var publicId = publicIdWithVersion.Contains('/') 
                    ? publicIdWithVersion.Substring(publicIdWithVersion.IndexOf('/') + 1)
                    : publicIdWithVersion;

                // Remove file extension
                publicId = Path.GetFileNameWithoutExtension(publicId);

                // Delete from Cloudinary
                var deleteParams = new DeletionParams(publicId);

                var result = await _cloudinary.DestroyAsync(deleteParams);

                if (result.StatusCode == System.Net.HttpStatusCode.OK && result.Result == "ok")
                {
                    return true;
                }
                else
                {
                    _logger.LogWarning("Failed to delete image from Cloudinary: {Result}", result.Result);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image from Cloudinary: {ImageUrl}", imageUrl);
                return false;
            }
        }
    }
}

