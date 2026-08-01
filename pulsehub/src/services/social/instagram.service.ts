export interface InstagramPost {
  mediaUrl: string;
  caption: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL';
}

export class InstagramService {

  static async post(accessToken: string, igUserId: string, post: InstagramPost) {
    // Step 1: Create media container
    const createRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: post.mediaUrl,
          caption: post.caption,
          access_token: accessToken,
        }),
      }
    );
    const container = await createRes.json();
    if (container.error) throw new Error(container.error.message);

    // Step 2: Publish container
    const publishRes = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: accessToken,
        }),
      }
    );
    const result = await publishRes.json();
    if (result.error) throw new Error(result.error.message);

    return { postId: result.id };
  }

  static async getComments(accessToken: string, igUserId: string, mediaId: string) {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${mediaId}/comments?access_token=${accessToken}`
    );
    const data = await res.json();
    return data.data || [];
  }

  static async getInsights(accessToken: string, igUserId: string) {
    const metrics = ['reach', 'impressions', 'engagement', 'follower_count'];
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/insights?metric=${metrics.join(',')}&period=day&access_token=${accessToken}`
    );
    const data = await res.json();
    return data.data || [];
  }
}
