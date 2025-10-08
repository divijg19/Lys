export function RootPersonJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Divij Ganjoo",
    url: "https://divijganjoo.me",
    sameAs: ["https://github.com/divijg19", "https://www.linkedin.com/in/divij-ganjoo"],
    jobTitle: "Software Developer",
  };
  return <script type="application/ld+json">{JSON.stringify(json)}</script>;
}
