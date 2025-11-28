import { NextRequest, NextResponse } from "next/server";

// Helper function to fetch video source from Facebook
async function fetchVideoSource(
  videoId: string,
  accessToken: string
): Promise<string | null> {
  try {
    const videoUrl = `https://graph.facebook.com/v24.0/${videoId}`;
    const videoParams = new URLSearchParams({
      access_token: accessToken,
      fields: "source,picture,thumbnails",
    });
    const response = await fetch(`${videoUrl}?${videoParams.toString()}`);
    if (response.ok) {
      const videoData = await response.json();
      return videoData.source || null;
    }
  } catch (error) {
    console.log("Could not fetch video source:", error);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get("ad_id");
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบ Facebook Access Token",
        },
        { status: 500 }
      );
    }
    if (!adId) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุ ad_id",
        },
        { status: 400 }
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

    // Fetch video source if video_id exists
    if (creativeData) {
      const videoId =
        creativeData.video_id ||
        creativeData.object_story_spec?.video_data?.video_id;
      if (videoId) {
        const videoSource = await fetchVideoSource(videoId, accessToken);
        if (videoSource) {
          creativeData.video_source = videoSource;
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
