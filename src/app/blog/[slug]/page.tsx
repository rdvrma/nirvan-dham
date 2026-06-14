import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/BlogPostPage';
import {
  getAllBlogPosts,
  getBlogImage,
  getBlogPostBySlug,
  getPostSeoDescription,
} from '@/lib/blog';

interface BlogPostRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog Not Found | Nirvan Dham',
    };
  }

  const title = `${post.hi.title} | ${post.en.title}`;
  const description = getPostSeoDescription(post, 'hi') || getPostSeoDescription(post, 'en');
  const image = getBlogImage(post);

  return {
    title: `${post.id}. ${title}`,
    description,
    keywords: [
      ...post.tags,
      'Nirvan Dham',
      'Aadisatv',
      'Advaita Vedanta',
      'Hindi spiritual blog',
      'English spiritual blog',
    ],
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      tags: post.tags,
      images: image
        ? [
            {
              url: image.src,
              width: image.width,
              height: image.height,
              alt: image.altEn,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image.src] : undefined,
    },
  };
}

export default async function BlogPostRoutePage({ params }: BlogPostRouteProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) notFound();

  return <BlogPostPage post={post} />;
}
