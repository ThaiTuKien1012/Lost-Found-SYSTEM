using System;
using System.Collections.Generic;
using LostAndFound.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LostAndFound.Infrastructure.Persistence;

public partial class LostAndFoundDbContext : DbContext
{
    public LostAndFoundDbContext()
    {
    }

    public LostAndFoundDbContext(DbContextOptions<LostAndFoundDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Campus> Campus { get; set; }

    public virtual DbSet<EmailOtp> EmailOtp { get; set; }

    public virtual DbSet<ItemCategories> ItemCategories { get; set; }

    public virtual DbSet<SecurityReceivedItems> SecurityReceivedItems { get; set; }

    public virtual DbSet<SecurityVerificationDecisions> SecurityVerificationDecisions { get; set; }

    public virtual DbSet<SecurityVerificationRequests> SecurityVerificationRequests { get; set; }

    public virtual DbSet<StaffFoundItems> StaffFoundItems { get; set; }

    public virtual DbSet<StaffReturnReceipts> StaffReturnReceipts { get; set; }

    public virtual DbSet<StudentClaims> StudentClaims { get; set; }

    public virtual DbSet<StudentLostReports> StudentLostReports { get; set; }

    public virtual DbSet<Users> Users { get; set; }

    public virtual DbSet<Notifications> Notifications { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // Configuration is provided via DI in Program.cs. No fallback here to avoid empty connection strings.
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Campus>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__campus__3213E83FC0778A98");

            entity.ToTable("campus");

            entity.HasIndex(e => e.Code, "UQ__campus__357D4CF9EBCFDE3A").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("address");
            entity.Property(e => e.Code)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("code");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<EmailOtp>(entity =>
        {
            entity.HasKey(e => e.OtpId).HasName("PK__EmailOTP__AEE354357865FADF");

            entity.ToTable("EmailOTP");

            entity.HasIndex(e => new { e.Email, e.Purpose, e.IsUsed, e.ExpiresAt }, "IX_EmailOTP_Email_Purpose_IsUsed");

            entity.Property(e => e.OtpId).HasColumnName("otp_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("datetime")
                .HasColumnName("expires_at");
            entity.Property(e => e.IsUsed)
                .HasDefaultValue(false)
                .HasColumnName("is_used");
            entity.Property(e => e.OtpCode)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("otp_code");
            entity.Property(e => e.Purpose)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("purpose");
        });

        modelBuilder.Entity<ItemCategories>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__item_cat__3213E83F9B10806D");

            entity.ToTable("item_categories");

            entity.HasIndex(e => e.Name, "UQ__item_cat__72E12F1B31B5FC09").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("name");
        });

        modelBuilder.Entity<SecurityReceivedItems>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__security__3213E83FAF1F12ED");

            entity.ToTable("security_received_items");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CampusId).HasColumnName("campus_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.FoundLocation)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("found_location");
            entity.Property(e => e.FoundTime)
                .HasColumnType("datetime")
                .HasColumnName("found_time");
            entity.Property(e => e.ItemCategoryId).HasColumnName("item_category_id");
            entity.Property(e => e.SecurityId).HasColumnName("security_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("status");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .IsUnicode(false)
                .HasColumnName("image_url");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Campus).WithMany()
                .HasForeignKey(d => d.CampusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__security___campu__5EBF139D");

            entity.HasOne(d => d.ItemCategory).WithMany(p => p.SecurityReceivedItems)
                .HasForeignKey(d => d.ItemCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__security___item___5FB337D6");

            entity.HasOne(d => d.Security).WithMany(p => p.SecurityReceivedItems)
                .HasForeignKey(d => d.SecurityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__security___secur__60A75C0F");
        });

        modelBuilder.Entity<SecurityVerificationDecisions>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__security__3213E83FEE87294C");

            entity.ToTable("security_verification_decisions");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Comment)
                .HasColumnType("text")
                .HasColumnName("comment");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Decision)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("decision");
            entity.Property(e => e.SecurityId).HasColumnName("security_id");
            entity.Property(e => e.VerificationRequestId).HasColumnName("verification_request_id");

            entity.HasOne(d => d.Security).WithMany(p => p.SecurityVerificationDecisions)
                .HasForeignKey(d => d.SecurityId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__security___secur__6D0D32F4");

            entity.HasOne(d => d.VerificationRequest).WithMany(p => p.SecurityVerificationDecisions)
                .HasForeignKey(d => d.VerificationRequestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__security___verif__6C190EBB");
        });

        modelBuilder.Entity<SecurityVerificationRequests>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__security__3213E83F08D13778");

            entity.ToTable("security_verification_requests");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClaimId).HasColumnName("claim_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.RequestedByStaffId).HasColumnName("requested_by_staff_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("status");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Claim).WithMany(p => p.SecurityVerificationRequests)
                .HasForeignKey(d => d.ClaimId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__security___claim__66603565");

            entity.HasOne(d => d.RequestedByStaff).WithMany(p => p.SecurityVerificationRequests)
                .HasForeignKey(d => d.RequestedByStaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__security___reque__6754599E");
        });

        modelBuilder.Entity<StaffFoundItems>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__staff_fo__3213E83FE95E9760");

            entity.ToTable("staff_found_items");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CampusId).HasColumnName("campus_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatedByStaff).HasColumnName("created_by_staff");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.FoundLocation)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("found_location");
            entity.Property(e => e.FoundTime)
                .HasColumnType("datetime")
                .HasColumnName("found_time");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("image_url");
            entity.Property(e => e.ItemCategoryId).HasColumnName("item_category_id");
            entity.Property(e => e.Source)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("source");
            entity.Property(e => e.Status)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("status");
            entity.Property(e => e.StorageLocation)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("storage_location");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Campus).WithMany()
                .HasForeignKey(d => d.CampusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__staff_fou__campu__4E88ABD4");

            entity.HasOne(d => d.CreatedByStaffNavigation).WithMany(p => p.StaffFoundItems)
                .HasForeignKey(d => d.CreatedByStaff)
                .HasConstraintName("FK__staff_fou__creat__5070F446");

            entity.HasOne(d => d.ItemCategory).WithMany(p => p.StaffFoundItems)
                .HasForeignKey(d => d.ItemCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__staff_fou__item___4F7CD00D");
        });

        modelBuilder.Entity<StaffReturnReceipts>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__staff_re__3213E83F070FD151");

            entity.ToTable("staff_return_receipts");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.ClaimId).HasColumnName("claim_id");
            entity.Property(e => e.ConfirmedFullName)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("confirmed_full_name");
            entity.Property(e => e.DocumentNumber)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("document_number");
            entity.Property(e => e.FoundItemId).HasColumnName("found_item_id");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone_number");
            entity.Property(e => e.ReturnedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("returned_at");
            entity.Property(e => e.SecurityId).HasColumnName("security_id");
            entity.Property(e => e.StaffId).HasColumnName("staff_id");
            entity.Property(e => e.StudentId).HasColumnName("student_id");

            entity.HasOne(d => d.Claim).WithMany(p => p.StaffReturnReceipts)
                .HasForeignKey(d => d.ClaimId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__staff_ret__claim__70DDC3D8");

            entity.HasOne(d => d.FoundItem).WithMany(p => p.StaffReturnReceipts)
                .HasForeignKey(d => d.FoundItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__staff_ret__found__71D1E811");

            entity.HasOne(d => d.Security).WithMany(p => p.StaffReturnReceiptsSecurity)
                .HasForeignKey(d => d.SecurityId)
                .HasConstraintName("FK__staff_ret__secur__74AE54BC");

            entity.HasOne(d => d.Staff).WithMany(p => p.StaffReturnReceiptsStaff)
                .HasForeignKey(d => d.StaffId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__staff_ret__staff__72C60C4A");

            entity.HasOne(d => d.Student).WithMany(p => p.StaffReturnReceiptsStudent)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__staff_ret__stude__73BA3083");
        });

        modelBuilder.Entity<StudentClaims>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__student___3213E83FB6412BAF");

            entity.ToTable("student_claims");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DecidedAt)
                .HasColumnType("datetime")
                .HasColumnName("decided_at");
            entity.Property(e => e.DecidedByStaff).HasColumnName("decided_by_staff");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.EvidenceUrl)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("evidence_url");
            entity.Property(e => e.FoundItemId).HasColumnName("found_item_id");
            entity.Property(e => e.LostReportId).HasColumnName("lost_report_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.DecidedByStaffNavigation).WithMany(p => p.StudentClaimsDecidedByStaffNavigation)
                .HasForeignKey(d => d.DecidedByStaff)
                .HasConstraintName("FK__student_c__decid__59063A47");

            entity.HasOne(d => d.FoundItem).WithMany(p => p.StudentClaims)
                .HasForeignKey(d => d.FoundItemId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__student_c__found__571DF1D5");

            entity.HasOne(d => d.LostReport).WithMany(p => p.StudentClaims)
                .HasForeignKey(d => d.LostReportId)
                .HasConstraintName("FK__student_c__lost___5812160E");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentClaimsStudent)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__student_c__stude__5629CD9C");
        });

        modelBuilder.Entity<StudentLostReports>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__student___3213E83F01D8B12B");

            entity.ToTable("student_lost_reports");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CampusId).HasColumnName("campus_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.ItemCategoryId).HasColumnName("item_category_id");
            entity.Property(e => e.LostLocation)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("lost_location");
            entity.Property(e => e.LostTime)
                .HasColumnType("datetime")
                .HasColumnName("lost_time");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("status");
            entity.Property(e => e.StudentId).HasColumnName("student_id");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("image_url"); // ← THÊM MAPPING MỚI

            entity.HasOne(d => d.Campus).WithMany(p => p.StudentLostReports)
                .HasForeignKey(d => d.CampusId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__student_l__campu__46E78A0C");

            entity.HasOne(d => d.ItemCategory).WithMany(p => p.StudentLostReports)
                .HasForeignKey(d => d.ItemCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__student_l__item___47DBAE45");

            entity.HasOne(d => d.Student).WithMany(p => p.StudentLostReports)
                .HasForeignKey(d => d.StudentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__student_l__stude__45F365D3");
        });

        modelBuilder.Entity<Users>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__users__3213E83F83CEEE08");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "UQ__users__AB6E6164973DEF48").IsUnique();

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(255)
                .HasColumnName("full_name");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("password_hash");
            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone_number");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("role");
            entity.Property(e => e.StudentCode)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("student_code");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        modelBuilder.Entity<Notifications>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__notifica__3213E83F");

            entity.ToTable("notifications");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("title");
            entity.Property(e => e.Message)
                .HasColumnType("text")
                .HasColumnName("message");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("type");
            entity.Property(e => e.RelatedEntityId).HasColumnName("related_entity_id");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            entity.Property(e => e.CreatedAt)
                .HasColumnType("datetime")
                .HasColumnName("created_at");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
