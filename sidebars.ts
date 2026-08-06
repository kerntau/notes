import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  notesSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '简介',
    },
  ],
  examSidebar: [
    {
      type: 'category',
      label: '历年真题与答案',
      collapsible: false,
      items: ['exam/2025', 'exam/2026'],
    },
  ],
};

export default sidebars;
