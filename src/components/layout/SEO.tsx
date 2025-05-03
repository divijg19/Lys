import Head from "next/head";

type SEOProps = {
  title: string;
  description: string;
  image?: string;
  url?: string;
};

const SEO = ({
  title,
  description,
  image = "/default-image.jpg",
  url = "/",
}: SEOProps) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={url} />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="robots" content="index, follow" />{" "}
    {/* Allow search engines to index and follow links */}
    <meta name="author" content="Your Name" />{" "}
    {/* Adjust with your name or site info */}
  </Head>
);

export default SEO;
