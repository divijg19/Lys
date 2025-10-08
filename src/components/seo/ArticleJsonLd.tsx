// JSON-LD script tag output (safe: purely static JSON serialization)
export function ArticleJsonLd(props: {
  title: string;
  description?: string;
  datePublished: string; // ISO
  dateModified?: string; // ISO
  url: string;
  tags: string[];
  image?: string;
  readingTime?: string;
}) {
  const { title, description, datePublished, dateModified, url, tags, image, readingTime } = props;
  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    url,
    image: image ? [image] : undefined,
    author: {
      "@type": "Person",
      name: "Divij Ganjoo",
      url: "https://divijganjoo.me",
    },
    keywords: tags.join(", "),
    wordCount: readingTime,
  };
  return <script type="application/ld+json">{JSON.stringify(json)}</script>;
}
