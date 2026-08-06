import React from 'react';
import { useLocation } from '@docusaurus/router';
import Footer from '@theme-original/Footer';

export default function FooterWrapper(props: Record<string, unknown>): React.JSX.Element | null {
  const { pathname } = useLocation();
  const showFooter =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/about/';

  if (!showFooter) {
    return null;
  }

  return <Footer {...props} />;
}
