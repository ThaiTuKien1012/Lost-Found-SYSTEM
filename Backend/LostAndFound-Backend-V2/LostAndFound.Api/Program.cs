using LostAndFound.Api.Filters;
using LostAndFound.Application.Interfaces;
using LostAndFound.Infrastructure.Persistence;
using LostAndFound.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// DbContext
var connectionString = builder.Configuration.GetConnectionString("LostAndFoundDb")
    ?? builder.Configuration["ConnectionStrings:LostAndFoundDb"]
    ?? builder.Configuration.GetConnectionString("LAFDb") // backward compatibility
    ?? builder.Configuration["ConnectionStrings:LAFDb"]
    ?? throw new InvalidOperationException("Connection string 'LostAndFoundDb' is not configured");

builder.Services.AddDbContext<LostAndFoundDbContext>(options =>
    options.UseSqlServer(connectionString));

// Service DI
builder.Services.AddScoped<IStudentLostReportService, StudentLostReportService>();
builder.Services.AddScoped<IStaffFoundItemService, StaffFoundItemService>();
builder.Services.AddScoped<IOtpService, OtpService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISecurityService, SecurityService>();
builder.Services.AddScoped<ICampusService, CampusService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// File Upload Service - Using Cloudinary
builder.Services.AddScoped<IFileUploadService>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var logger = provider.GetRequiredService<ILogger<CloudinaryUploadService>>();
    
    var cloudName = configuration["Cloudinary:CloudName"] 
        ?? throw new InvalidOperationException("Cloudinary CloudName is not configured");
    var apiKey = configuration["Cloudinary:ApiKey"] 
        ?? throw new InvalidOperationException("Cloudinary ApiKey is not configured");
    var apiSecret = configuration["Cloudinary:ApiSecret"] 
        ?? throw new InvalidOperationException("Cloudinary ApiSecret is not configured");
    
    return new CloudinaryUploadService(cloudName, apiKey, apiSecret, logger);
});

// Staff Services
builder.Services.AddScoped<IStaffClaimService, StaffClaimService>();
builder.Services.AddScoped<IStaffFoundItemService, StaffFoundItemService>();
builder.Services.AddScoped<IStaffLostReportReadService, StaffLostReportReadService>();
builder.Services.AddScoped<IStaffReturnService, StaffReturnService>();
builder.Services.AddScoped<IStaffSecurityRequestService, StaffSecurityRequestService>();

// Student Services
builder.Services.AddScoped<IStudentClaimService, StudentClaimService>();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
        ValidAudience = builder.Configuration["JWT:ValidAudience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]
                ?? throw new InvalidOperationException("JWT Secret is not configured"))
        ),
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

builder.Services.AddAuthorization();

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5174",
            "https://localhost:5173",
            "https://localhost:3000",
            "https://localhost:3001"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Lost and Found API", Version = "v1" });

    // Map IFormFile to avoid schema generation errors
    c.MapType<IFormFile>(() => new OpenApiSchema
    {
        Type = "string",
        Format = "binary"
    });

    // JWT
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });

    // Configure file upload support
    c.OperationFilter<FileUploadOperationFilter>();
    c.ParameterFilter<FileUploadParameterFilter>();
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS - Must be before UseAuthentication and UseAuthorization
app.UseCors("AllowFrontend");

// Enable static files for image uploads
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
