import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  description: ReactNode;
  icon: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Cell Recycling',
    icon: '♻️',
    description: (
      <>
        Reuses rendered cells for off-screen items, just like FlashList.
        Render 10,000 items with the memory footprint of 15 cells.
      </>
    ),
  },
  {
    title: 'Sticky Headers',
    icon: '📌',
    description: (
      <>
        Section headers stick to the top while scrolling through their section.
        Fully customizable with shadow and animation support.
      </>
    ),
  },
  {
    title: 'Collapsible Sections',
    icon: '🗂️',
    description: (
      <>
        Expand and collapse sections programmatically or via user interaction.
        Smooth animations and persistent state support.
      </>
    ),
  },
  {
    title: '60fps Scrolling',
    icon: '⚡',
    description: (
      <>
        Absolute positioning and transform-based updates ensure buttery smooth
        scrolling even with thousands of items.
      </>
    ),
  },
  {
    title: 'TypeScript First',
    icon: '📘',
    description: (
      <>
        Full TypeScript support with generic types for your item data.
        Catch errors at compile time, not runtime.
      </>
    ),
  },
  {
    title: 'Drop-in Replacement',
    icon: '🔄',
    description: (
      <>
        Similar API to React Native's SectionList. Migrate existing code
        with minimal changes.
      </>
    ),
  },
];

function Feature({title, icon, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <div className={styles.featureIcon}>{icon}</div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
