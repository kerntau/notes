import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import AnnouncementBarOriginal from '@theme-original/AnnouncementBar';

export default function AnnouncementBarWrapper(props: any) {
  const { pathname } = useLocation();
  const { siteConfig } = useDocusaurusContext();
  const baseUrl = siteConfig.baseUrl || '/';

  // 仅在首页呈现公告栏
  const isHomePage = pathname === '/' || pathname === baseUrl;
  if (!isHomePage) {
    return null;
  }

  return <AnnouncementBarOriginal {...props} />;
}

