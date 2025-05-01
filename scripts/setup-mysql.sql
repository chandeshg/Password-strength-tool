CREATE USER IF NOT EXISTS 'password_tool_user'@'localhost' IDENTIFIED BY 'your_password_here';
CREATE DATABASE IF NOT EXISTS password_tool;
GRANT ALL PRIVILEGES ON password_tool.* TO 'password_tool_user'@'localhost';
FLUSH PRIVILEGES;
