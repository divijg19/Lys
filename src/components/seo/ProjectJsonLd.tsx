import { SITE_URL } from "@/lib/site";

// JSON-LD script tag output (safe: purely static JSON serialization)
export function ProjectJsonLd(props: {
  title: string;
  description?: string;
  url: string;
  repository?: string;
  tags: string[];
  image?: string;
}) {
  const { title, description, url, repository, tags, image } = props;
  const json = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: title,
    description,
    codeRepository: repository,
    keywords: tags.join(", "),
    url,
    image,
    author: {
      "@type": "Person",
      name: "Divij Ganjoo",
      url: SITE_URL,
    },
  };
  return <script type="application/ld+json">{JSON.stringify(json)}</script>;
}
