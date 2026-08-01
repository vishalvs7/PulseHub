export class RedditService {

  static async post(accessToken: string, subreddit: string, title: string, text: string) {
    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sr: subreddit,
        title,
        text,
        kind: 'self',
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(`Reddit API error: ${data.error}`);
    return { postId: data.data?.id };
  }
}
