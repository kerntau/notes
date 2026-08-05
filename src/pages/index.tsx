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
        {/* 倒计时精细模块 */}
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

        {/* 精细小巧行动按钮组 */}
        <div className={styles.buttonsContainer}>
          <Link
            to="/blog"
            className={clsx('button button--primary', styles.btnPrimary)}>
            开始学习
          </Link>
          <Link
            to="/docs/intro"
            className={clsx('button button--secondary', styles.btnSecondary)}>
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
        {/* 版权声明、开源致谢与网络加速 */}
        <div className={styles.noticeSection}>
          <div className={styles.noticeGrid}>
            <div className={styles.noticeItem}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeBadge}>CC BY-NC-ND 4.0</span>
                <h3 className={styles.noticeTitle}>版权与使用协议</h3>
              </div>
              <p className={styles.noticeText}>
                本站笔记与备考资料仅供个人学习交流浏览。未经授权，禁止商业用途、二次打包或转载。请尊重原创新血。
              </p>
              <div className={styles.noticeFooter}>
                <a
                  href="https://creativecommons.org/licenses/by-nc-nd/4.0/deed.zh-hans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.noticeLink}>
                  查看协议细则 ↗
                </a>
              </div>
            </div>

            <div className={styles.noticeItem}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeBadge}>Open Source Credits</span>
                <h3 className={styles.noticeTitle}>开源社区致谢</h3>
              </div>
              <p className={styles.noticeText}>
                本站点基于 Facebook 开源项目 Docusaurus 驱动构建。衷心感谢开源社区提供的卓越文档系统框架与技术支持。
              </p>
              <div className={styles.noticeFooter}>
                <a
                  href="https://github.com/facebook/docusaurus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.noticeLink}>
                  访问官方仓库 ↗
                </a>
              </div>
            </div>

            <div className={styles.noticeItem}>
              <div className={styles.noticeHeader}>
                <span className={styles.noticeBadge}>CDN Acceleration</span>
                <h3 className={styles.noticeTitle}>网络加速致谢</h3>
              </div>
              <p className={styles.noticeText}>
                衷心致谢 CDN 全域分发网络为本站点提供的毫秒级静态资源加速响应与 DDoS 安全防护保障。
              </p>
              <div className={styles.noticeFooter}>
                <img
                  src="/img/headLogo.daeb48ad.png"
                  alt="Tencent EdgeOne"
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
      title={`首页 - ${siteConfig.title}`}
      description="序记 - 个人数字花园与知识库">
      <HomepageHeader />
      <HomepageMainSection />
    </Layout>
  );
}
