import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import styles from './about.module.css';
import stats from '../data/stats.json';

export default function About(): React.JSX.Element {
  const heatmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('aboutpage-fullscreen');

    const scrollToRight = () => {
      if (heatmapRef.current) {
        heatmapRef.current.scrollLeft = heatmapRef.current.scrollWidth;
      }
    };

    scrollToRight();
    // 延迟再次对齐以防 SVG 图片异步渲染完成前 scrollWidth 变化
    const timer = setTimeout(scrollToRight, 100);

    return () => {
      document.documentElement.classList.remove('aboutpage-fullscreen');
      clearTimeout(timer);
    };
  }, []);

  return (
    <Layout
      title="关于"
      description="关于序记 - GitHub 贡献与项目总字数"
      wrapperClassName={styles.aboutWrapper}>
      <main className={styles.page}>
        <h1 className={styles.title}>关于序记</h1>

        <div className={styles.card}>
          {/* 顶部信息栏 */}
          <div className={styles.topBar}>
            <a
              href="https://github.com/kerntau/notes"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.identity}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className={styles.mark}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span className={styles.repo}>kerntau / notes</span>
            </a>
            <div className={styles.wordcount}>
              <span className={styles.num}>{stats.totalWords.toLocaleString()}</span>
              <span className={styles.unit}>字</span>
            </div>
          </div>

          {/* 简介说明与联系邮箱 */}
          <p className={styles.description}>
            持续记录 2027 年湖北省专升本备考笔记、系统化学习心得与技术探索成果。如有任何疑问、学习交流或建议反馈，欢迎发送邮件至 <a href="mailto:i@curn.me" className={styles.emailText}>i@curn.me</a> 与我联系。
          </p>

          {/* 贡献热力图区域 */}
          <div className={styles.heatmapWrapper}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>GitHub 贡献日历</span>
              <a
                href="https://github.com/kerntau"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.profileLink}>
                @kerntau ↗
              </a>
            </div>
            <div className={styles.heatmap} ref={heatmapRef}>
              <a href="https://github.com/kerntau" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://ghchart.rshah.org/4a90e2/kerntau"
                  alt="GitHub Contributions"
                  className={styles.img}
                  loading="eager"
                />
              </a>
            </div>
          </div>
        </div>

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
      </main>
    </Layout>
  );
}
