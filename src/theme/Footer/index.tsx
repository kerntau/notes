import React from 'react';
import { useLocation } from '@docusaurus/router';
import Footer from '@theme-original/Footer';

export default function FooterWrapper(props: Record<string, unknown>): React.JSX.Element | null {
  const { pathname } = useLocation();
  const isHomepage = pathname === '/' || pathname === '/en' || pathname === '/en/';

  if (!isHomepage) {
    return null;
  }

  return <Footer {...props} />;
}
