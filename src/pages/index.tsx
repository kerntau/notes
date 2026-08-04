import React, { useState, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function FramelessUnit({ value, label }: { value: number | string; label: string }) {
  const formatted = String(value).padStart(label === '天' ? 1 : 2, '0');
  return (
    <div className={styles.framelessUnit}>
      <div className={styles.numberDisplay}>{formatted}</div>
      <span className={styles.unitLabel}>{label}</span>
    </div>
  );
}

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
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
        {/* 1. 倒计时部分 */}
        <div className={styles.countdownWrapper}>
          <div className={styles.countdownTitle}>
            距离 2027年湖北省专升本考试（4月17日）还有
          </div>
          {timeLeft.isOver ? (
            <div style={{ fontSize: '1.35rem', fontWeight: 'bold' }}>
              🎉 考试已开始/结束！祝逢考必过！
            </div>
          ) : (
            <div className={styles.framelessContainer}>
              <FramelessUnit value={timeLeft.days} label="天" />
              <span className={styles.colon}>:</span>
              <FramelessUnit value={timeLeft.hours} label="时" />
              <span className={styles.colon}>:</span>
              <FramelessUnit value={timeLeft.minutes} label="分" />
              <span className={styles.colon}>:</span>
              <FramelessUnit value={timeLeft.seconds} label="秒" />
            </div>
          )}
        </div>

        {/* 2. 官方质感行动按钮 */}
        <div className={styles.buttonsContainer}>
          <Link
            to="/blog"
            className={clsx('button button--primary button--lg', styles.btnPrimary)}>
            开始学习
          </Link>
          <Link
            to="/docs/intro"
            className={clsx('button button--secondary button--lg', styles.btnSecondary)}>
            查看笔记
          </Link>
        </div>
      </div>
    </header>
  );
}

function HomepageMainSection() {
  return (
    <main className={styles.mainSection}>
      <div className="container">
        {/* 版权声明与开源致谢（极简无卡片纯净排版） */}
        <div className={styles.noticeSection}>
          <div className={styles.noticeGrid}>
            <div className={styles.noticeItem}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeBadge}>CC BY-NC-ND 4.0</span>
                <h3 className={styles.noticeTitle}>版权与使用协议</h3>
              </div>
              <p className={styles.noticeText}>
                本站点包含的所有笔记、教程与备考资料仅供个人学习交流与浏览查看。未经授权，禁止任何商业用途、二次开发、二次打包或公开发布转载。请尊重原创新血与开源成果。
              </p>
              <a
                href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.noticeLink}>
                查看 CC BY-NC-ND 4.0 协议细则 ↗
              </a>
            </div>

            <div className={styles.noticeItem}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeBadge}>Open Source Credits</span>
                <h3 className={styles.noticeTitle}>开源社区致谢</h3>
              </div>
              <p className={styles.noticeText}>
                本站点基于 Facebook 开源项目 Docusaurus 驱动构建。衷心感谢 Docusaurus 官方及开源社区为全球开发者提供的卓越文档系统框架与技术支持。
              </p>
              <a
                href="https://github.com/facebook/docusaurus"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.noticeLink}>
                访问 Docusaurus 官方开源仓库 ↗
              </a>
            </div>

            <div className={styles.noticeItem}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeBadge}>CDN Acceleration</span>
                <h3 className={styles.noticeTitle}>网络加速致谢</h3>
              </div>
              <p className={styles.noticeText}>
                衷心致谢全站 CDN 加速网络对本站点提供的海量并发分发、毫秒级静态资源响应与 DDoS 安全防护支持。
              </p>
              <div style={{ marginTop: 'auto', paddingTop: '0.4rem' }}>
                <img
                  src="/img/headLogo.daeb48ad.png"
                  alt="CDN 加速支持"
                  className={styles.cdnLogo}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <HomepageHeader />
      <HomepageMainSection />
    </Layout>
  );
}






