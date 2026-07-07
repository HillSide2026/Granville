import rss from '@astrojs/rss';
import { fetchPosts } from '~/utils/blog';
import { SITE } from 'astrowind:config';

export async function GET(context: { site: URL }) {
  const posts = await fetchPosts();
  return rss({
    title: `${SITE.name} Whitepaper`,
    description: 'Insights on financial infrastructure, payments, and technology from Granville Finance.',
    site: context.site,
    items: posts.map((post) => ({
      title: post.title,
      description: post.excerpt ?? '',
      pubDate: post.publishDate,
      link: `/${post.permalink}`,
    })),
  });
}
