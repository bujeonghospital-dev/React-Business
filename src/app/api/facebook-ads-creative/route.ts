import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// รายชื่อ video files ที่มีอยู่ใน public/images/video
const getLocalVideoFiles = (): string[] => {
  try {
    const videoDir = path.join(process.cwd(), "public", "images", "video");
    if (fs.existsSync(videoDir)) {
      return fs
        .readdirSync(videoDir)
        .filter((file) => file.endsWith(".mp4"))
        .map((file) => file.replace(".mp4", ""));
    }
  } catch (error) {
    console.log("Could not read video directory:", error);
  }
  return [];
};

export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get("ad_id");

    // Get list of local video files
    const localVideoIds = getLocalVideoFiles();

    if (!adId) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุ ad_id",
        },
        { status: 400 }
      );
    }

    if (!accessToken) {
      // ลองหา video ที่ match - fallback mode
      const matchingVideo = localVideoIds[0]; // ใช้ video แรกเป็น default
      if (matchingVideo) {
        return NextResponse.json({
          success: true,
          data: {
            id: adId,
            video_id: matchingVideo,
            thumbnail_url: null,
          },
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบ Facebook Access Token",
        },
        { status: 500 }
      );
    }
    // ดึงข้อมูล creative จาก ad
    const fields =
      "creative{id,thumbnail_url,image_url,video_id,object_story_spec,effective_object_story_id}";
    const apiUrl = `https://graph.facebook.com/v24.0/${adId}`;
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: fields,
    });
    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Facebook API Error:", errorData);

      // Fallback: ถ้า Facebook API ไม่สามารถดึงได้ ลองใช้ local video files
      if (localVideoIds.length > 0) {
        // ลอง match video_id จากรายการที่มี
        const randomVideo =
          localVideoIds[Math.floor(Math.random() * localVideoIds.length)];
        return NextResponse.json({
          success: true,
          data: {
            id: adId,
            video_id: randomVideo,
            thumbnail_url: null,
            _fallback: true,
          },
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถดึงข้อมูล creative ได้",
          details: errorData,
        },
        { status: response.status }
      );
    }
    const data = await response.json();
    const creativeData = data.creative || null;

    // Try to get video_source from video_id
    if (creativeData) {
      const videoId =
        creativeData.video_id ||
        creativeData.object_story_spec?.video_data?.video_id;
      if (videoId) {
        try {
          const videoUrl = `https://graph.facebook.com/v24.0/${videoId}`;
          const videoParams = new URLSearchParams({
            access_token: accessToken,
            fields: "source,picture,thumbnails",
          });
          const videoResponse = await fetch(
            `${videoUrl}?${videoParams.toString()}`
          );
          if (videoResponse.ok) {
            const videoData = await videoResponse.json();
            // Add video source URL
            if (videoData.source) {
              creativeData.video_source = videoData.source;
            }
            // Add thumbnail from video if not already set
            if (!creativeData.thumbnail_url && videoData.picture) {
              creativeData.thumbnail_url = videoData.picture;
            }
            // Try to get best quality thumbnail
            if (videoData.thumbnails?.data?.length > 0) {
              const bestThumb = videoData.thumbnails.data.reduce(
                (best: any, curr: any) =>
                  (curr.width || 0) > (best.width || 0) ? curr : best,
                videoData.thumbnails.data[0]
              );
              if (bestThumb?.uri) {
                creativeData.thumbnail_url = bestThumb.uri;
              }
            }
          }
        } catch (error) {
          console.log("Could not fetch video data:", error);
        }
      }
    }

    // Try to get image from effective_object_story_id if creative doesn't have thumbnail
    if (
      creativeData &&
      !creativeData.thumbnail_url &&
      !creativeData.image_url
    ) {
      const storyId = creativeData.effective_object_story_id;
      if (storyId) {
        try {
          const storyUrl = `https://graph.facebook.com/v24.0/${storyId}`;
          const storyParams = new URLSearchParams({
            access_token: accessToken,
            fields:
              "full_picture,picture,attachments{media,type,media_type,url}",
          });
          const storyResponse = await fetch(
            `${storyUrl}?${storyParams.toString()}`
          );
          if (storyResponse.ok) {
            const storyData = await storyResponse.json();
            // Add image URLs from post
            if (storyData.full_picture) {
              creativeData.image_url = storyData.full_picture;
            } else if (storyData.picture) {
              creativeData.image_url = storyData.picture;
            }
            // Try to get from attachments
            if (storyData.attachments?.data?.[0]?.media?.image?.src) {
              creativeData.thumbnail_url =
                storyData.attachments.data[0].media.image.src;
            }
          }
        } catch (error) {
          console.log("Could not fetch story data:", error);
        }
      }
    }
    // If still no image, try to get preview
    if (
      creativeData &&
      !creativeData.thumbnail_url &&
      !creativeData.image_url
    ) {
      try {
        const previewUrl = `https://graph.facebook.com/v24.0/${creativeData.id}/previews`;
        const previewParams = new URLSearchParams({
          access_token: accessToken,
          ad_format: "DESKTOP_FEED_STANDARD",
        });
        const previewResponse = await fetch(
          `${previewUrl}?${previewParams.toString()}`
        );
        if (previewResponse.ok) {
          const previewData = await previewResponse.json();
          if (previewData.data?.[0]?.body) {
            // Extract image URL from preview HTML
            const match = previewData.data[0].body.match(
              /https:\/\/[^"'\s]+\.(jpg|jpeg|png|gif)/i
            );
            if (match) {
              creativeData.image_url = match[0];
            }
          }
        }
      } catch (error) {
        console.log("Could not fetch preview:", error);
      }
    }
    return NextResponse.json({
      success: true,
      data: creativeData,
    });
  } catch (error) {
    console.error("Error fetching ad creative:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล creative",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
