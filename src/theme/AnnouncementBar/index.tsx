import React from 'react';
import { useLocation } from '@docusaurus/router';
import AnnouncementBarOriginal from '@theme-original/AnnouncementBar';

export default function AnnouncementBarWrapper(props: any) {
  const { pathname } = useLocation();
  // 教程页面 (/blog 及子页面) 不再显示顶栏通告
  if (pathname.startsWith('/blog')) {
    return null;
  }
  return <AnnouncementBarOriginal {...props} />;
}
