import { NextRequest, NextResponse } from "next/server";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Helper function to fetch video source from Facebook
async function fetchVideoSource(
  videoId: string,
  accessToken: string
): Promise<{ source: string | null; picture: string | null }> {
  try {
    const videoUrl = `https://graph.facebook.com/v24.0/${videoId}`;
    const videoParams = new URLSearchParams({
      access_token: accessToken,
      fields: "source,picture,thumbnails",
    });
    const response = await fetch(`${videoUrl}?${videoParams.toString()}`);
    if (response.ok) {
      const videoData = await response.json();
      return {
        source: videoData.source || null,
        picture: videoData.picture || null,
      };
    }
  } catch (error) {
    console.log("Could not fetch video source:", error);
  }
  return { source: null, picture: null };
}

// Helper function to try multiple methods to get creative data
async function tryFetchCreative(
  adId: string,
  accessToken: string
): Promise<{
  success: boolean;
  data: Record<string, unknown> | null;
  error?: string;
}> {
  // Method 1: Try fetching ad with creative field
  try {
    const fields =
      "creative{id,thumbnail_url,image_url,video_id,object_story_spec,effective_object_story_id},adcreatives{id,thumbnail_url,image_url,video_id}";
    const apiUrl = `https://graph.facebook.com/v24.0/${adId}`;
    const params = new URLSearchParams({
      access_token: accessToken,
      fields: fields,
    });
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.creative) {
        console.log(`✅ Method 1 success for ad ${adId}`);
        return { success: true, data: data.creative };
      }
      if (data.adcreatives?.data?.[0]) {
        console.log(`✅ Method 1 (adcreatives) success for ad ${adId}`);
        return { success: true, data: data.adcreatives.data[0] };
      }
    }
  } catch (error) {
    console.log(`Method 1 failed for ${adId}:`, error);
  }

  // Method 2: Try fetching ad preview image
  try {
    const previewUrl = `https://graph.facebook.com/v24.0/${adId}`;
    const previewParams = new URLSearchParams({
      access_token: accessToken,
      fields: "preview_shareable_link,effective_status,name",
    });
    const response = await fetch(`${previewUrl}?${previewParams.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.preview_shareable_link) {
        console.log(`✅ Method 2 success for ad ${adId}`);
        return {
          success: true,
          data: {
            id: adId,
            preview_link: data.preview_shareable_link,
            // We'll generate a placeholder based on ad name
            image_url: null,
            thumbnail_url: null,
          },
        };
      }
    }
  } catch (error) {
    console.log(`Method 2 failed for ${adId}:`, error);
  }

  // Method 3: Return a placeholder structure
  console.log(`⚠️ All methods failed for ad ${adId}, returning placeholder`);
  return {
    success: true,
    data: {
      id: adId,
      thumbnail_url: null,
      image_url: null,
      video_id: null,
      is_placeholder: true,
    },
  };
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
        { status: 500, headers: corsHeaders }
      );
    }
    if (!adId) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุ ad_id",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Try multiple methods to fetch creative data
    const result = await tryFetchCreative(adId, accessToken);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถดึงข้อมูล creative ได้",
        },
        { status: 404, headers: corsHeaders }
      );
    }

    const creativeData = result.data as Record<string, unknown>;

    // Fetch video source if video_id exists
    if (creativeData) {
      const objectStorySpec = creativeData.object_story_spec as
        | Record<string, unknown>
        | undefined;
      const videoData = objectStorySpec?.video_data as
        | Record<string, unknown>
        | undefined;
      const videoId = creativeData.video_id || videoData?.video_id;

      if (videoId && typeof videoId === "string") {
        const videoResult = await fetchVideoSource(videoId, accessToken);
        if (videoResult.source) {
          creativeData.video_source = videoResult.source;
        }
        // Use video picture as thumbnail if we don't have one
        if (!creativeData.thumbnail_url && videoResult.picture) {
          creativeData.thumbnail_url = videoResult.picture;
        }
      }
    }
    // Try to get image from effective_object_story_id if creative doesn't have thumbnail
    if (
      creativeData &&
      !creativeData.thumbnail_url &&
      !creativeData.image_url
    ) {
      const storyId = creativeData.effective_object_story_id as
        | string
        | undefined;
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
    return NextResponse.json(
      {
        success: true,
        data: creativeData,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error fetching ad creative:", error);
    return NextResponse.json(
      {
        success: false,
        error: "เกิดข้อผิดพลาดในการดึงข้อมูล creative",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
