import path from 'path';
import { ROOT_DIR } from '../config';

/**
 * 校验传入路径是否在项目根目录之内，防止路径遍历攻击
 */
export function isSafePath(targetPath: string): boolean {
  if (!targetPath) return false;
  const resolved = path.resolve(ROOT_DIR, targetPath);
  const rootResolved = path.resolve(ROOT_DIR);
  return resolved === rootResolved || resolved.startsWith(rootResolved + path.sep);
}

/**
 * 获取相对于 ROOT_DIR 的绝对路径
 */
export function resolveSafePath(relOrAbsPath: string): string {
  const resolved = path.isAbsolute(relOrAbsPath)
    ? path.resolve(relOrAbsPath)
    : path.resolve(ROOT_DIR, relOrAbsPath);

  if (!isSafePath(resolved)) {
    throw new Error(`安全违规：禁止访问工作区外路径 [${relOrAbsPath}]`);
  }
  return resolved;
}
