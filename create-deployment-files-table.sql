-- =====================================================
-- Deployment Files Tracking Table
-- สำหรับเก็บข้อมูลไฟล์และ path ที่ deploy ไปยัง server
-- =====================================================

-- Drop table if exists (optional - comment out in production)
-- DROP TABLE IF EXISTS deployment_files;

-- Create deployment_files table
CREATE TABLE IF NOT EXISTS deployment_files (
    id SERIAL PRIMARY KEY,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_extension VARCHAR(50),
    file_size BIGINT,
    file_hash VARCHAR(64), -- SHA256 hash for file integrity
    
    -- Deployment Information
    local_path VARCHAR(1000),
    remote_path VARCHAR(1000),
    server_ip VARCHAR(45), -- supports IPv4 and IPv6
    server_name VARCHAR(255),
    
    -- Transfer Details
    transfer_protocol VARCHAR(20) DEFAULT 'SFTP', -- SFTP, FTP, SCP
    transfer_status VARCHAR(50) DEFAULT 'pending', -- pending, uploading, completed, failed
    transfer_start_time TIMESTAMP WITH TIME ZONE,
    transfer_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    file_type VARCHAR(100), -- source, config, build, asset, etc.
    category VARCHAR(100), -- frontend, backend, database, documentation
    description TEXT,
    
    -- Versioning
    version VARCHAR(50),
    git_commit_hash VARCHAR(40),
    git_branch VARCHAR(255),
    
    -- User tracking
    uploaded_by VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deployment_files_file_name ON deployment_files(file_name);
CREATE INDEX IF NOT EXISTS idx_deployment_files_file_path ON deployment_files(file_path);
CREATE INDEX IF NOT EXISTS idx_deployment_files_transfer_status ON deployment_files(transfer_status);
CREATE INDEX IF NOT EXISTS idx_deployment_files_server_ip ON deployment_files(server_ip);
CREATE INDEX IF NOT EXISTS idx_deployment_files_created_at ON deployment_files(created_at);
CREATE INDEX IF NOT EXISTS idx_deployment_files_category ON deployment_files(category);
CREATE INDEX IF NOT EXISTS idx_deployment_files_file_type ON deployment_files(file_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_deployment_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_deployment_files_updated_at ON deployment_files;
CREATE TRIGGER trigger_deployment_files_updated_at
    BEFORE UPDATE ON deployment_files
    FOR EACH ROW
    EXECUTE FUNCTION update_deployment_files_updated_at();

-- =====================================================
-- Sample Insert Queries
-- =====================================================

-- Insert single file record
INSERT INTO deployment_files (
    file_name,
    file_path,
    file_extension,
    file_size,
    local_path,
    remote_path,
    server_ip,
    server_name,
    transfer_protocol,
    transfer_status,
    file_type,
    category,
    uploaded_by,
    git_branch
) VALUES (
    'package.json',
    '/React-Business_BJH/package.json',
    'json',
    5240,
    'C:\Users\Pac-Man45\OneDrive\Documents\GitHub\React-Business_BJH\package.json',
    '/C:/inetpub/wwwroot/React-Business_BJH/package.json',
    '192.168.1.10',
    'BJH-Production-Server',
    'SFTP',
    'completed',
    'config',
    'frontend',
    'Administrator',
    'Film_dev_v2'
);

-- Insert multiple files (batch insert)
INSERT INTO deployment_files (file_name, file_path, file_extension, file_type, category, local_path, remote_path, server_ip, transfer_status, uploaded_by)
VALUES 
    ('next.config.js', '/React-Business_BJH/next.config.js', 'js', 'config', 'frontend', 'C:\Users\Pac-Man45\OneDrive\Documents\GitHub\React-Business_BJH\next.config.js', '/C:/inetpub/wwwroot/React-Business_BJH/next.config.js', '192.168.1.10', 'pending', 'Administrator'),
    ('.env.production', '/React-Business_BJH/.env.production', 'production', 'config', 'frontend', 'C:\Users\Pac-Man45\OneDrive\Documents\GitHub\React-Business_BJH\.env.production', '/C:/inetpub/wwwroot/React-Business_BJH/.env.production', '192.168.1.10', 'pending', 'Administrator'),
    ('database-schema.sql', '/React-Business_BJH/database-schema.sql', 'sql', 'source', 'database', 'C:\Users\Pac-Man45\OneDrive\Documents\GitHub\React-Business_BJH\database-schema.sql', '/C:/inetpub/wwwroot/React-Business_BJH/database-schema.sql', '192.168.1.10', 'pending', 'Administrator');

-- =====================================================
-- Useful Query Examples
-- =====================================================

-- Get all files by server
-- SELECT * FROM deployment_files WHERE server_ip = '192.168.1.10' ORDER BY created_at DESC;

-- Get files by category
-- SELECT * FROM deployment_files WHERE category = 'frontend' ORDER BY file_name;

-- Get pending uploads
-- SELECT * FROM deployment_files WHERE transfer_status = 'pending';

-- Get recent deployments (last 24 hours)
-- SELECT * FROM deployment_files 
-- WHERE created_at >= NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC;

-- Get file count by category
-- SELECT category, COUNT(*) as file_count 
-- FROM deployment_files 
-- GROUP BY category 
-- ORDER BY file_count DESC;

-- Get total size by server
-- SELECT server_ip, server_name, 
--        COUNT(*) as total_files,
--        SUM(file_size) as total_size_bytes,
--        ROUND(SUM(file_size) / 1024.0 / 1024.0, 2) as total_size_mb
-- FROM deployment_files
-- GROUP BY server_ip, server_name;

-- Update transfer status
-- UPDATE deployment_files 
-- SET transfer_status = 'completed', 
--     transfer_end_time = CURRENT_TIMESTAMP 
-- WHERE id = 1;

-- Delete old records (older than 30 days)
-- DELETE FROM deployment_files 
-- WHERE created_at < NOW() - INTERVAL '30 days' 
-- AND transfer_status = 'completed';

-- =====================================================
-- View for easy reporting
-- =====================================================

CREATE OR REPLACE VIEW v_deployment_summary AS
SELECT 
    server_ip,
    server_name,
    category,
    transfer_status,
    COUNT(*) as file_count,
    COALESCE(SUM(file_size), 0) as total_size_bytes,
    MAX(created_at) as last_deployment
FROM deployment_files
GROUP BY server_ip, server_name, category, transfer_status
ORDER BY server_ip, category;

-- View for file listing
CREATE OR REPLACE VIEW v_deployment_files_list AS
SELECT 
    id,
    file_name,
    file_extension,
    file_type,
    category,
    transfer_status,
    server_name,
    uploaded_by,
    created_at,
    ROUND(file_size / 1024.0, 2) as size_kb
FROM deployment_files
ORDER BY created_at DESC;

-- =====================================================
-- End of Script
-- =====================================================
