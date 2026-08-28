import path from 'path';

export const ROOT_DIR = path.resolve(__dirname, '../../../');
export const DOCS_DIR = path.join(ROOT_DIR, 'docs');
export const BLOG_DIR = path.join(ROOT_DIR, 'blog');
export const STATIC_DIR = path.join(ROOT_DIR, 'static');
export const STATIC_IMG_DIR = path.join(STATIC_DIR, 'img');
export const DATA_DIR = path.join(ROOT_DIR, 'src/data');
export const BACKUP_DIR = path.join(ROOT_DIR, '.studio_backups');
export const CONFIG_FILE = path.join(ROOT_DIR, 'docusaurus.config.ts');
export const SIDEBARS_FILE = path.join(ROOT_DIR, 'sidebars.ts');

export const SERVER_PORT = process.env.STUDIO_PORT ? parseInt(process.env.STUDIO_PORT, 10) : 4200;
export const HOST = '127.0.0.1';
