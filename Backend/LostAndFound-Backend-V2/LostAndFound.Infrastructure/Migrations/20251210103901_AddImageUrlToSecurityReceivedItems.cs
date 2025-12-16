using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LostAndFound.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToSecurityReceivedItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "campus",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    address = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__campus__3213E83FC0778A98", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "EmailOTP",
                columns: table => new
                {
                    otp_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    email = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    otp_code = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    expires_at = table.Column<DateTime>(type: "datetime", nullable: true),
                    is_used = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    purpose = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__EmailOTP__AEE354357865FADF", x => x.otp_id);
                });

            migrationBuilder.CreateTable(
                name: "item_categories",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__item_cat__3213E83F9B10806D", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    full_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    email = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    student_code = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    phone_number = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__users__3213E83F83CEEE08", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "security_received_items",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    campus_id = table.Column<int>(type: "int", nullable: false),
                    item_category_id = table.Column<int>(type: "int", nullable: false),
                    security_id = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    found_time = table.Column<DateTime>(type: "datetime", nullable: false),
                    found_location = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    image_url = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__security__3213E83FAF1F12ED", x => x.id);
                    table.ForeignKey(
                        name: "FK__security___campu__5EBF139D",
                        column: x => x.campus_id,
                        principalTable: "campus",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__security___item___5FB337D6",
                        column: x => x.item_category_id,
                        principalTable: "item_categories",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__security___secur__60A75C0F",
                        column: x => x.security_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "staff_found_items",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    campus_id = table.Column<int>(type: "int", nullable: false),
                    item_category_id = table.Column<int>(type: "int", nullable: false),
                    created_by_staff = table.Column<int>(type: "int", nullable: true),
                    source = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    found_time = table.Column<DateTime>(type: "datetime", nullable: false),
                    found_location = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    status = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    storage_location = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    image_url = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__staff_fo__3213E83FE95E9760", x => x.id);
                    table.ForeignKey(
                        name: "FK__staff_fou__campu__4E88ABD4",
                        column: x => x.campus_id,
                        principalTable: "campus",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__staff_fou__creat__5070F446",
                        column: x => x.created_by_staff,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__staff_fou__item___4F7CD00D",
                        column: x => x.item_category_id,
                        principalTable: "item_categories",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "student_lost_reports",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    campus_id = table.Column<int>(type: "int", nullable: false),
                    item_category_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    lost_time = table.Column<DateTime>(type: "datetime", nullable: true),
                    lost_location = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__student___3213E83F01D8B12B", x => x.id);
                    table.ForeignKey(
                        name: "FK__student_l__campu__46E78A0C",
                        column: x => x.campus_id,
                        principalTable: "campus",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__student_l__item___47DBAE45",
                        column: x => x.item_category_id,
                        principalTable: "item_categories",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__student_l__stude__45F365D3",
                        column: x => x.student_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "student_claims",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    found_item_id = table.Column<int>(type: "int", nullable: false),
                    lost_report_id = table.Column<int>(type: "int", nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    evidence_url = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    decided_by_staff = table.Column<int>(type: "int", nullable: true),
                    decided_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__student___3213E83FB6412BAF", x => x.id);
                    table.ForeignKey(
                        name: "FK__student_c__decid__59063A47",
                        column: x => x.decided_by_staff,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__student_c__found__571DF1D5",
                        column: x => x.found_item_id,
                        principalTable: "staff_found_items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__student_c__lost___5812160E",
                        column: x => x.lost_report_id,
                        principalTable: "student_lost_reports",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__student_c__stude__5629CD9C",
                        column: x => x.student_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "security_verification_requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    claim_id = table.Column<int>(type: "int", nullable: false),
                    requested_by_staff_id = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    updated_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__security__3213E83F08D13778", x => x.id);
                    table.ForeignKey(
                        name: "FK__security___claim__66603565",
                        column: x => x.claim_id,
                        principalTable: "student_claims",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__security___reque__6754599E",
                        column: x => x.requested_by_staff_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "staff_return_receipts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    claim_id = table.Column<int>(type: "int", nullable: false),
                    found_item_id = table.Column<int>(type: "int", nullable: false),
                    staff_id = table.Column<int>(type: "int", nullable: false),
                    student_id = table.Column<int>(type: "int", nullable: false),
                    security_id = table.Column<int>(type: "int", nullable: true),
                    confirmed_full_name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    document_number = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    phone_number = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    returned_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__staff_re__3213E83F070FD151", x => x.id);
                    table.ForeignKey(
                        name: "FK__staff_ret__claim__70DDC3D8",
                        column: x => x.claim_id,
                        principalTable: "student_claims",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__staff_ret__found__71D1E811",
                        column: x => x.found_item_id,
                        principalTable: "staff_found_items",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__staff_ret__secur__74AE54BC",
                        column: x => x.security_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__staff_ret__staff__72C60C4A",
                        column: x => x.staff_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__staff_ret__stude__73BA3083",
                        column: x => x.student_id,
                        principalTable: "users",
                        principalColumn: "id");
                });

            migrationBuilder.CreateTable(
                name: "security_verification_decisions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    verification_request_id = table.Column<int>(type: "int", nullable: false),
                    security_id = table.Column<int>(type: "int", nullable: false),
                    decision = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    comment = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__security__3213E83FEE87294C", x => x.id);
                    table.ForeignKey(
                        name: "FK__security___secur__6D0D32F4",
                        column: x => x.security_id,
                        principalTable: "users",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK__security___verif__6C190EBB",
                        column: x => x.verification_request_id,
                        principalTable: "security_verification_requests",
                        principalColumn: "id");
                });

            migrationBuilder.CreateIndex(
                name: "UQ__campus__357D4CF9EBCFDE3A",
                table: "campus",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmailOTP_Email_Purpose_IsUsed",
                table: "EmailOTP",
                columns: new[] { "email", "purpose", "is_used", "expires_at" });

            migrationBuilder.CreateIndex(
                name: "UQ__item_cat__72E12F1B31B5FC09",
                table: "item_categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_security_received_items_campus_id",
                table: "security_received_items",
                column: "campus_id");

            migrationBuilder.CreateIndex(
                name: "IX_security_received_items_item_category_id",
                table: "security_received_items",
                column: "item_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_security_received_items_security_id",
                table: "security_received_items",
                column: "security_id");

            migrationBuilder.CreateIndex(
                name: "IX_security_verification_decisions_security_id",
                table: "security_verification_decisions",
                column: "security_id");

            migrationBuilder.CreateIndex(
                name: "IX_security_verification_decisions_verification_request_id",
                table: "security_verification_decisions",
                column: "verification_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_security_verification_requests_claim_id",
                table: "security_verification_requests",
                column: "claim_id");

            migrationBuilder.CreateIndex(
                name: "IX_security_verification_requests_requested_by_staff_id",
                table: "security_verification_requests",
                column: "requested_by_staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_found_items_campus_id",
                table: "staff_found_items",
                column: "campus_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_found_items_created_by_staff",
                table: "staff_found_items",
                column: "created_by_staff");

            migrationBuilder.CreateIndex(
                name: "IX_staff_found_items_item_category_id",
                table: "staff_found_items",
                column: "item_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_return_receipts_claim_id",
                table: "staff_return_receipts",
                column: "claim_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_return_receipts_found_item_id",
                table: "staff_return_receipts",
                column: "found_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_return_receipts_security_id",
                table: "staff_return_receipts",
                column: "security_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_return_receipts_staff_id",
                table: "staff_return_receipts",
                column: "staff_id");

            migrationBuilder.CreateIndex(
                name: "IX_staff_return_receipts_student_id",
                table: "staff_return_receipts",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_claims_decided_by_staff",
                table: "student_claims",
                column: "decided_by_staff");

            migrationBuilder.CreateIndex(
                name: "IX_student_claims_found_item_id",
                table: "student_claims",
                column: "found_item_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_claims_lost_report_id",
                table: "student_claims",
                column: "lost_report_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_claims_student_id",
                table: "student_claims",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_lost_reports_campus_id",
                table: "student_lost_reports",
                column: "campus_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_lost_reports_item_category_id",
                table: "student_lost_reports",
                column: "item_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_student_lost_reports_student_id",
                table: "student_lost_reports",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "UQ__users__AB6E6164973DEF48",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmailOTP");

            migrationBuilder.DropTable(
                name: "security_received_items");

            migrationBuilder.DropTable(
                name: "security_verification_decisions");

            migrationBuilder.DropTable(
                name: "staff_return_receipts");

            migrationBuilder.DropTable(
                name: "security_verification_requests");

            migrationBuilder.DropTable(
                name: "student_claims");

            migrationBuilder.DropTable(
                name: "staff_found_items");

            migrationBuilder.DropTable(
                name: "student_lost_reports");

            migrationBuilder.DropTable(
                name: "campus");

            migrationBuilder.DropTable(
                name: "item_categories");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
