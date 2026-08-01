export class LinkedInService {

  static async post(accessToken: string, author: string, text: string, mediaUrl?: string) {
    const body: any = {
      author: `urn:li:organization:${author}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: mediaUrl ? 'IMAGE' : 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    if (mediaUrl) {
      body.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        media: mediaUrl,
      }];
    }

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return { postId: data.id };
  }
}
