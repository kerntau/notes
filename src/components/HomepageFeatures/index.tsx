import React, { type ReactNode } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.actionContainer}>
          <Link to="/blog" className={styles.actionCard}>
            <div className={styles.iconWrapper}>🎓</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>开始学习</h3>
              <p className={styles.cardDesc}>
                系统化梳理核心知识点与全阶段备考教程
              </p>
            </div>
            <span className={styles.arrowIcon}>→</span>
          </Link>

          <Link to="/docs/intro" className={styles.actionCard}>
            <div className={styles.iconWrapper}>📖</div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>查看笔记</h3>
              <p className={styles.cardDesc}>
                查阅备考复习笔记、重点解析与资料总结
              </p>
            </div>
            <span className={styles.arrowIcon}>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

