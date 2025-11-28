import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to get video source URL directly from Facebook Graph API
 * This allows playing Facebook ad videos directly in the browser
 *
 * Usage: GET /api/facebook-video-source?video_id=123456789
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get("video_id");

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบ Facebook Access Token",
        },
        { status: 500 }
      );
    }

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุ video_id",
        },
        { status: 400 }
      );
    }

    // Fetch video details from Facebook Graph API
    const videoUrl = `https://graph.facebook.com/v24.0/${videoId}`;
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: "source,picture,thumbnails,length,title,description,created_time",
    });

    const response = await fetch(`${videoUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Facebook Video API Error:", errorData);

      // Check if it's an access/permission error
      if (errorData.error?.code === 10 || errorData.error?.code === 100) {
        return NextResponse.json(
          {
            success: false,
            error: "ไม่มีสิทธิ์เข้าถึงวิดีโอนี้",
            details: errorData.error?.message,
            fallback_urls: {
              reel: `https://www.facebook.com/reel/${videoId}`,
              watch: `https://www.facebook.com/watch/?v=${videoId}`,
            },
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถดึงข้อมูลวิดีโอได้",
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // If no source URL (might be restricted), provide fallback links
    if (!data.source) {
      return NextResponse.json({
        success: true,
        data: {
          video_id: videoId,
          source: null,
          picture: data.picture || null,
          thumbnails: data.thumbnails?.data || [],
          duration: data.length || null,
          title: data.title || null,
          fallback_urls: {
            reel: `https://www.facebook.com/reel/${videoId}`,
            watch: `https://www.facebook.com/watch/?v=${videoId}`,
          },
          message: "วิดีโอนี้ไม่สามารถเล่นโดยตรงได้ กรุณาเปิดดูใน Facebook",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        video_id: videoId,
        source: data.source,
        picture: data.picture || null,
        thumbnails: data.thumbnails?.data || [],
        duration: data.length || null,
        title: data.title || null,
        created_time: data.created_time || null,
        fallback_urls: {
          reel: `https://www.facebook.com/reel/${videoId}`,
          watch: `https://www.facebook.com/watch/?v=${videoId}`,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching video source:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูลวิดีโอ",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
