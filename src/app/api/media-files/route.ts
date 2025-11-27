import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

/**
 * API สำหรับจัดการ Media Files (รูปภาพ, วิดีโอ, คลิป)
 *
 * GET /api/media-files - ดึงข้อมูลไฟล์ทั้งหมด
 * POST /api/media-files - อัพโหลดไฟล์ใหม่
 */

interface MediaFile {
  id: number;
  name: string;
  description: string;
  type: "image" | "video" | "clip";
  url: string;
  thumbnail: string;
  size: string;
  date: string;
  tags: string[];
  favorite: boolean;
  views: number;
  duration?: string;
  category: string;
}

// GET - ดึงข้อมูล Media Files ทั้งหมด
export async function GET(request: NextRequest) {
  const client = await pool.connect();

  try {
    const { searchParams } = new URL(request.url);

    // Query Parameters
    const type = searchParams.get("type"); // image, video, clip
    const category = searchParams.get("category");
    const favorite = searchParams.get("favorite");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log("🔄 Fetching media files from database...");

    // Build dynamic query
    const conditions: string[] = ["m.is_active = TRUE"];
    const params: any[] = [];
    let paramIndex = 1;

    if (type && type !== "all") {
      conditions.push(`m.file_type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (category && category !== "all") {
      conditions.push(`m.category_name = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (favorite === "true") {
      conditions.push(`m.is_favorite = TRUE`);
    }

    if (search) {
      conditions.push(`(
        m.name ILIKE $${paramIndex} OR 
        m.description ILIKE $${paramIndex} OR 
        m.category_name ILIKE $${paramIndex} OR
        EXISTS (SELECT 1 FROM media_tags t WHERE t.media_id = m.id AND t.tag_name ILIKE $${paramIndex})
      )`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sort column
    const validSortColumns = ["created_at", "name", "file_size", "view_count"];
    const sortColumn = validSortColumns.includes(sortBy)
      ? sortBy
      : "created_at";
    const sortDir = sortOrder.toLowerCase() === "asc" ? "ASC" : "DESC";

    const query = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.file_type,
        m.file_url,
        m.thumbnail_base64,
        m.mime_type,
        m.file_size,
        m.file_size_display,
        m.duration,
        m.duration_seconds,
        m.width,
        m.height,
        m.category_name,
        m.is_favorite,
        m.view_count,
        m.download_count,
        m.like_count,
        m.uploaded_by_name,
        m.created_at,
        m.updated_at,
        COALESCE(
          ARRAY_AGG(t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL), 
          ARRAY[]::VARCHAR[]
        ) as tags
      FROM media_files m
      LEFT JOIN media_tags t ON m.id = t.media_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY m.id
      ORDER BY m.${sortColumn} ${sortDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);

    console.log("📝 Executing query:", query);
    console.log("📝 With params:", params);

    const result = await client.query(query, params);

    // Count total
    const countQuery = `
      SELECT COUNT(DISTINCT m.id) as total
      FROM media_files m
      LEFT JOIN media_tags t ON m.id = t.media_id
      WHERE ${conditions.join(" AND ")}
    `;
    const countResult = await client.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0]?.total || "0");

    console.log(`✅ Found ${result.rows.length} media files (total: ${total})`);

    // แปลงข้อมูลเป็น format สำหรับ Frontend
    const mediaFiles: MediaFile[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name || "",
      description: row.description || "",
      type: row.file_type as "image" | "video" | "clip",
      url: row.file_url || "",
      thumbnail: row.thumbnail_base64 || row.file_url || "",
      size: row.file_size_display || formatFileSize(row.file_size),
      date: formatDate(row.created_at),
      tags: row.tags || [],
      favorite: row.is_favorite || false,
      views: row.view_count || 0,
      duration: row.duration,
      category: row.category_name || "Uncategorized",
    }));

    // Get stats
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE file_type = 'image') as images,
        COUNT(*) FILTER (WHERE file_type = 'video') as videos,
        COUNT(*) FILTER (WHERE file_type = 'clip') as clips,
        COUNT(*) FILTER (WHERE is_favorite = TRUE) as favorites,
        COALESCE(SUM(view_count), 0) as total_views
      FROM media_files
      WHERE is_active = TRUE
    `;
    const statsResult = await client.query(statsQuery);
    const stats = statsResult.rows[0];

    return NextResponse.json({
      success: true,
      data: mediaFiles,
      total,
      stats: {
        total:
          parseInt(stats.images) +
          parseInt(stats.videos) +
          parseInt(stats.clips),
        images: parseInt(stats.images),
        videos: parseInt(stats.videos),
        clips: parseInt(stats.clips),
        favorites: parseInt(stats.favorites),
        totalViews: parseInt(stats.total_views),
      },
      pagination: {
        limit,
        offset,
        hasMore: offset + result.rows.length < total,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching media files:", error);

    return NextResponse.json(
      {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// POST - อัพโหลด Media File ใหม่
export async function POST(request: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const {
      name,
      description,
      file_type,
      file_url,
      thumbnail_base64,
      file_base64,
      mime_type,
      file_size,
      duration,
      duration_seconds,
      width,
      height,
      category_name,
      tags,
      uploaded_by,
      uploaded_by_name,
    } = body;

    // Validate required fields
    if (!name || !file_type) {
      return NextResponse.json(
        { success: false, error: "Name and file_type are required" },
        { status: 400 }
      );
    }

    if (!["image", "video", "clip"].includes(file_type)) {
      return NextResponse.json(
        {
          success: false,
          error: "file_type must be 'image', 'video', or 'clip'",
        },
        { status: 400 }
      );
    }

    console.log("📤 Uploading new media file:", name);

    await client.query("BEGIN");

    // Insert media file
    const insertQuery = `
      INSERT INTO media_files (
        name,
        description,
        file_type,
        file_url,
        thumbnail_base64,
        file_base64,
        mime_type,
        file_size,
        file_size_display,
        duration,
        duration_seconds,
        width,
        height,
        category_name,
        uploaded_by,
        uploaded_by_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `;

    const result = await client.query(insertQuery, [
      name,
      description || null,
      file_type,
      file_url || null,
      thumbnail_base64 || null,
      file_base64 || null,
      mime_type || null,
      file_size || null,
      formatFileSize(file_size),
      duration || null,
      duration_seconds || null,
      width || null,
      height || null,
      category_name || null,
      uploaded_by || null,
      uploaded_by_name || null,
    ]);

    const mediaId = result.rows[0].id;

    // Insert tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const tagValues = tags
        .map((tag: string, index: number) => `($1, $${index + 2})`)
        .join(", ");

      const tagQuery = `
        INSERT INTO media_tags (media_id, tag_name)
        VALUES ${tagValues}
        ON CONFLICT (media_id, tag_name) DO NOTHING
      `;

      await client.query(tagQuery, [mediaId, ...tags]);
    }

    await client.query("COMMIT");

    console.log(`✅ Media file uploaded successfully with ID: ${mediaId}`);

    return NextResponse.json({
      success: true,
      data: {
        id: mediaId,
        name,
        file_type,
      },
      message: "Media file uploaded successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error uploading media file:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// Helper Functions
function formatFileSize(bytes: number | null): string {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(date: string | Date | null): string {
  if (!date) return new Date().toISOString().split("T")[0];

  if (typeof date === "string") {
    return date.split("T")[0];
  }

  return date.toISOString().split("T")[0];
}
