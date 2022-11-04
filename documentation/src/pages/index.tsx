import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";

const features = [
  { title: "Auto-generated changelogs from Git history" },
  { title: "Auto-generated API documentations (using FastAPI)" },
  { title: "Auto-generated API clients (using openapi generator)" },
  { title: "Pre-commit hooks" },
  { title: "CI/CD (using Github Actions)" },
  { title: "Pydantic data validation" },
  { title: "OAuth2" },
  { title: "Standardized API error and response model" },
  { title: "Run using Docker" },
  { title: "Documentation solution (using Docusaurus)" },
];

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero hero--primary", styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/about/introduction"
          >
            Start reading the docs
          </Link>
        </div>
      </div>
    </header>
  );
}

function Feature({ title }) {
  return <div className={clsx(styles.feature)}>{title}</div>;
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Frontpage | ${siteConfig.title}`}
      description={`Frontpage for ${siteConfig.title}`}
    >
      <HomepageHeader />
      <main>
        {features?.length > 0 && (
          <>
            <h2 className={styles.description}>Features include:</h2>
            <section className={"container " + styles.features}>
              {features.map((props, idx) => (
                <Feature key={idx} {...props} />
              ))}
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}
