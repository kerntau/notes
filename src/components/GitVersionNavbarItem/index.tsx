import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

// 读取打包自动生成的 stats.json 统计与 Git 信息
import stats from '../../data/stats.json';

interface GitVersionNavbarItemProps {
  mobile?: boolean;
}

export default function GitVersionNavbarItem({ mobile = false }: GitVersionNavbarItemProps): React.ReactNode {
  if (mobile) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imgError, setImgError] = useState(false);

  const gitAuthor = stats.gitAuthor || 'kerntau';
  const gitCommit = stats.gitCommit || 'latest';
  const gitDate = stats.gitDate || stats.updatedAt || '2026-08-09';
  const gitMsg = stats.gitMsg || '更新笔记与依赖';
  const appVersion = stats.appVersion || gitCommit;
  const totalWordsFormatted = (stats.totalWords / 10000).toFixed(1) + ' 万字';
  const repoUrl = 'https://github.com/kerntau/notes';
  const commitUrl = `${repoUrl}/commit/${gitCommit}`;

  // 提取 GitHub 头像 URL 与回退字母
  const avatarUrl = `https://github.com/${gitAuthor}.png?size=64`;
  const avatarLetter = gitAuthor ? gitAuthor.charAt(0).toUpperCase() : 'K';

  // 监听外部点击/触摸关闭卡片
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(prev => !prev);
  };

  const versionDisplay = appVersion;

  return (
    <div
      ref={containerRef}
      className={clsx(styles.container, {
        [styles.mobileContainer]: mobile,
        [styles.isOpen]: isOpen,
      })}
    >
      <button
        type="button"
        onClick={toggleOpen}
        className={clsx(styles.trigger, { [styles.mobileTrigger]: mobile })}
        title="查看最新 Git 提交信息"
        aria-expanded={isOpen}
      >
        <span>{versionDisplay}</span>
        <svg
          className={clsx(styles.caret, { [styles.caretOpen]: isOpen })}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4.427 6.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 6H4.604a.25.25 0 00-.177.427z" />
        </svg>
      </button>

      <div className={clsx(styles.popover, { [styles.mobilePopover]: mobile })}>
        <div className={styles.popoverHeader}>
          <div className={styles.authorBox}>
            <div className={styles.avatar}>
              {!imgError ? (
                <img
                  src={avatarUrl}
                  alt={gitAuthor}
                  className={styles.avatarImg}
                  onError={() => setImgError(true)}
                />
              ) : (
                avatarLetter
              )}
            </div>
            <span>{gitAuthor}</span>
          </div>
          <a
            href={commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.commitBadge}
          >
            {gitCommit}
          </a>
        </div>

        <div className={styles.popoverBody}>
          <div className={styles.commitMsgLabel}>COMMIT 提交说明</div>
          <div className={styles.commitMsg}>{gitMsg}</div>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span>提交时间</span>
              <span className={styles.metaValue}>{gitDate}</span>
            </div>
            <div className={styles.metaItem}>
              <span>全站字数</span>
              <span className={styles.metaValue}>
                {stats.docsCount} 篇 · {totalWordsFormatted}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
