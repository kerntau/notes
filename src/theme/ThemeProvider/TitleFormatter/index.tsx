import React, { type ComponentProps, type ReactNode } from 'react';
import { TitleFormatterProvider } from '@docusaurus/theme-common/internal';
import type { Props } from '@theme/ThemeProvider/TitleFormatter';

type FormatterProp = ComponentProps<typeof TitleFormatterProvider>['formatter'];

const formatter: FormatterProp = ({ title, siteTitle }) => {
  const trimmed = title?.trim();
  return trimmed && trimmed !== siteTitle ? trimmed : siteTitle;
};

export default function ThemeProviderTitleFormatter({
  children,
}: Props): ReactNode {
  return (
    <TitleFormatterProvider formatter={formatter}>
      {children}
    </TitleFormatterProvider>
  );
}
