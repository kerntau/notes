import React, { useState, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function CompactUnit({ value, label }: { value: number | string; label: string }) {
  const formatted = String(value).padStart(label === '天' ? 1 : 2, '0');
  return (
    <div className={styles.compactUnit}>
      <div className={styles.compactNumber}>{formatted}</div>
      <span className={styles.compactLabel}>{label}</span>
    </div>
  );
}

function HomepageHeader() {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOver: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: false });

  useEffect(() => {
    const targetDate = new Date('2027-04-17T09:00:00+08:00').getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        {/* 倒计时模块 */}
        <div className={styles.countdownWrapper}>
          <div className={styles.countdownTitle}>
            距离 2027年湖北省专升本考试（4月17日）还有
          </div>
          {timeLeft.isOver ? (
            <div className={styles.overNotice}>
              🎉 考试已开始/结束！祝逢考必过！
            </div>
          ) : (
            <div className={styles.compactContainer}>
              <CompactUnit value={timeLeft.days} label="天" />
              <span className={styles.colon}>:</span>
              <CompactUnit value={timeLeft.hours} label="时" />
              <span className={styles.colon}>:</span>
              <CompactUnit value={timeLeft.minutes} label="分" />
              <span className={styles.colon}>:</span>
              <CompactUnit value={timeLeft.seconds} label="秒" />
            </div>
          )}
        </div>

        {/* 行动按钮 */}
        <div className={styles.buttonsContainer}>
          <Link
            to="/docs/intro"
            className={clsx('button button--primary', styles.btnPrimary)}>
            开始学习
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();

  useEffect(() => {
    document.documentElement.classList.add('homepage-fullscreen');
    return () => document.documentElement.classList.remove('homepage-fullscreen');
  }, []);

  return (
    <Layout
      title={`首页 - ${siteConfig.title}`}
      description="序记 - 个人数字花园与知识库"
      wrapperClassName={styles.homepageWrapper}>
      <HomepageHeader />
    </Layout>
  );
}
