USE LostAndFoundDB;
GO

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM staff_return_receipts;
DELETE FROM security_verification_decisions;
DELETE FROM security_verification_requests;
DELETE FROM student_claims;
DELETE FROM security_received_items;
DELETE FROM staff_found_items;
DELETE FROM student_lost_reports;
DELETE FROM notifications;
DELETE FROM EmailOTP;
DELETE FROM users;
DELETE FROM item_categories;
DELETE FROM campus;
GO

-- Insert Campus
INSERT INTO campus (code, name, address) VALUES
('NVH', N'Nam Sài Gòn', N'Đường D1, Khu Công nghệ cao, Quận 9, TP.HCM'),
('SHTP', N'Saigon Hi-Tech Park', N'Lô E2a-7, Đường D1, Khu Công nghệ cao, Quận 9, TP.HCM');
GO

-- Insert Item Categories
INSERT INTO item_categories (name, description) VALUES
(N'Điện thoại', N'Smartphone, điện thoại di động'),
(N'Ví/Bóp', N'Ví, bóp, ví da'),
(N'Túi xách', N'Túi xách, ba lô, cặp'),
(N'Laptop', N'Máy tính xách tay'),
(N'Đồng hồ', N'Đồng hồ đeo tay'),
(N'Sách', N'Sách, vở, tài liệu'),
(N'Chìa khóa', N'Chìa khóa, móc khóa'),
(N'Khác', N'Các vật dụng khác');
GO

-- Insert Users (password hash cho "Password123!")
-- Hash: $2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu
INSERT INTO users (full_name, email, password_hash, role, student_code, phone_number) VALUES
(N'Nguyễn Văn A', 'sv001@fptu.edu.vn', '$2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu', 'STUDENT', 'SV001', '0901234567'),
(N'Trần Thị B', 'sv002@fptu.edu.vn', '$2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu', 'STUDENT', 'SV002', '0901234568'),
(N'Lê Văn C', 'sv003@fptu.edu.vn', '$2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu', 'STUDENT', 'SV003', '0901234569'),
(N'Phạm Văn D', 'staff001@fptu.edu.vn', '$2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu', 'STAFF', NULL, '0901234570'),
(N'Hoàng Văn E', 'sec001@fptu.edu.vn', '$2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu', 'SECURITY', NULL, '0901234571'),
(N'Vũ Thị F', 'sec002@fptu.edu.vn', '$2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu', 'SECURITY', NULL, '0901234572'),
(N'Admin System', 'admin@fptu.edu.vn', '$2a$10$kQtUcTt1NHv.XWk3s84Z.ebNoR5bhh8lVUam54T7hqibP6qo.ieuu', 'ADMIN', NULL, '0901234573');
GO

-- Insert Student Lost Reports
INSERT INTO student_lost_reports (student_id, campus_id, item_category_id, title, description, lost_time, lost_location, status) VALUES
(1, 1, 1, N'Mất điện thoại iPhone 13', N'Mặt lưng xước, bao da đỏ, mất tại phòng A101', '2025-12-01 08:30:00', N'Phòng A101, Tầng 1, Building A', 'PENDING'),
(2, 2, 2, N'Mất ví da màu nâu', N'Ví da bò màu nâu, có thẻ sinh viên bên trong', '2025-12-02 14:20:00', N'Thư viện, Tầng 2', 'PENDING'),
(1, 1, 4, N'Mất Laptop Dell XPS 13', N'Laptop màu bạc, màn hình 13 inch, có sticker FPTU', '2025-12-03 12:00:00', N'Canteen, Tầng 2, Building A', 'PENDING');
GO

-- Insert Staff Found Items
INSERT INTO staff_found_items (campus_id, item_category_id, created_by_staff, source, description, found_time, found_location, status, storage_location) VALUES
(1, 1, 4, 'SECURITY', N'Điện thoại màu đen, có vết xước phía sau, bao da đỏ', '2025-12-03 10:00:00', N'Quầy tiếp tân, Tầng 1', 'STORED_AT_OFFICE', N'Kho A, Kệ số 5'),
(2, 2, 4, 'SECURITY', N'Ví da bò màu nâu, có thẻ sinh viên', '2025-12-03 15:00:00', N'Thư viện, Tầng 2', 'STORED_AT_OFFICE', N'Kho B, Kệ số 3'),
(1, 4, 4, 'SECURITY', N'Laptop Dell, màn hình 13 inch, có sticker FPTU', '2025-12-03 13:00:00', N'Canteen, Tầng 2', 'STORED_AT_OFFICE', N'Kho A, Kệ số 8');
GO

-- Insert Security Received Items
INSERT INTO security_received_items (campus_id, item_category_id, security_id, description, color, found_time, found_location, status) VALUES
(1, 1, 5, N'Điện thoại màu đen, có vết xước phía sau', N'Black', '2025-12-03 10:00:00', N'Quầy tiếp tân, Tầng 1', 'AtSecurity'),
(2, 2, 6, N'Ví da bò màu nâu, có thẻ sinh viên', N'Brown', '2025-12-03 15:00:00', N'Thư viện, Tầng 2', 'AtSecurity');
GO

PRINT 'Data imported successfully!';
GO

