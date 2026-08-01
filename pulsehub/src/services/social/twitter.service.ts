export class TwitterService {

  static async post(accessToken: string, text: string, mediaUrls?: string[]) {
    const res = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.errors) throw new Error(data.errors[0]?.message);
    return { postId: data.data?.id };
  }

  static async getMentions(accessToken: string, userId: string) {
    const res = await fetch(
      `https://api.twitter.com/2/users/${userId}/mentions?max_results=20`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );
    const data = await res.json();
    return data.data || [];
  }
}
