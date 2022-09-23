import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Start reading the docs
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Frontpage | ${siteConfig.title}`}
      description={`Frontpage for ${siteConfig.title}`}>
      <HomepageHeader />
      <main>
        <div className="container">
          <p className={styles.description}>
            Template FastAPI React is a solution template for creating a Single Page App (SPA) with React and FastAPI following the principles of Clean Architecture.
          </p>
        </div>
      </main>
    </Layout>
  );
}
