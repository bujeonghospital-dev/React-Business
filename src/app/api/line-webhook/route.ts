import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;

// Store groups in memory (in production, use database)
// This will be synced to client via API
let discoveredGroups: Array<{
  id: string;
  name: string;
  type: "group" | "room";
  discoveredAt: string;
}> = [];

// Verify LINE signature (optional but recommended for security)
async function verifySignature(body: string, signature: string): Promise<boolean> {
  if (!LINE_CHANNEL_SECRET) return true; // Skip if not configured
  
  try {
    const crypto = await import('crypto');
    const hmac = crypto.createHmac('sha256', LINE_CHANNEL_SECRET);
    hmac.update(body);
    const expectedSignature = hmac.digest('base64');
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// POST - Receive webhook events from LINE
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature') || '';
    
    // Verify signature
    if (LINE_CHANNEL_SECRET && !await verifySignature(body, signature)) {
      console.error('Invalid LINE webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const data = JSON.parse(body);
    console.log('LINE Webhook received:', JSON.stringify(data, null, 2));
    
    // Process events
    for (const event of data.events || []) {
      const sourceType = event.source?.type;
      const sourceId = event.source?.groupId || event.source?.roomId;
      
      // Bot joined a group or room
      if (event.type === 'join' && sourceId) {
        const groupInfo = {
          id: sourceId,
          name: `LINE ${sourceType === 'group' ? 'Group' : 'Room'} (${sourceId.slice(-8)})`,
          type: sourceType as "group" | "room",
          discoveredAt: new Date().toISOString(),
        };
        
        // Add if not exists
        if (!discoveredGroups.find(g => g.id === sourceId)) {
          discoveredGroups.push(groupInfo);
          console.log('✅ Bot joined new group:', groupInfo);
        }
      }
      
      // Message in group - can capture group ID
      if (event.type === 'message' && sourceId) {
        // Check if we already have this group
        if (!discoveredGroups.find(g => g.id === sourceId)) {
          const groupInfo = {
            id: sourceId,
            name: `LINE ${sourceType === 'group' ? 'Group' : 'Room'} (${sourceId.slice(-8)})`,
            type: sourceType as "group" | "room",
            discoveredAt: new Date().toISOString(),
          };
          discoveredGroups.push(groupInfo);
          console.log('✅ Discovered group from message:', groupInfo);
        }
        
        // If message is "!groupid" or "กลุ่มid", reply with group ID
        const messageText = event.message?.text?.toLowerCase() || '';
        if (messageText === '!groupid' || messageText === 'กลุ่มid' || messageText === 'group id') {
          // Reply with group ID using LINE Messaging API
          const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
          if (LINE_CHANNEL_ACCESS_TOKEN) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [
                  {
                    type: 'text',
                    text: `📋 Group ID:\n${sourceId}\n\nคัดลอก ID นี้ไปใส่ในระบบแชร์วิดีโอได้เลย!`,
                  },
                ],
              }),
            });
          }
        }
      }
      
      // Bot left group
      if (event.type === 'leave' && sourceId) {
        discoveredGroups = discoveredGroups.filter(g => g.id !== sourceId);
        console.log('Bot left group:', sourceId);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('LINE Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// GET - Get list of discovered groups
export async function GET() {
  return NextResponse.json({
    groups: discoveredGroups,
    count: discoveredGroups.length,
    instructions: {
      th: [
        "1. เปิดแอป LINE",
        "2. เชิญ Bot เข้ากลุ่มที่ต้องการ",
        "3. พิมพ์ '!groupid' ในกลุ่ม เพื่อรับ Group ID",
        "4. คัดลอก ID ไปใส่ในระบบแชร์วิดีโอ",
      ],
      en: [
        "1. Open LINE app",
        "2. Invite the Bot to your group",
        "3. Type '!groupid' in the group to get Group ID",
        "4. Copy the ID to the video sharing system",
      ],
    },
    tip: "หรือพิมพ์ 'กลุ่มid' หรือ 'group id' ก็ได้เช่นกัน",
  });
}
