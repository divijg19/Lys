import { SITE_URL } from "@/lib/site";

export function RootPersonJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Divij Ganjoo",
    url: SITE_URL,
    sameAs: ["https://github.com/divijg19", "https://www.linkedin.com/in/divij-ganjoo"],
    jobTitle: "Software Developer",
  };
  return <script type="application/ld+json">{JSON.stringify(json)}</script>;
}
