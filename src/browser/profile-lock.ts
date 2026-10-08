import { createHash } from 'node:crypto';
import { mkdir, realpath } from 'node:fs/promises';
import { createServer } from 'node:net';

/** A Windows kernel-owned pipe prevents competing launches and vanishes on exit. */
export async function acquireWindowsProfileLock(profileDir: string): Promise<() => Promise<void>> {
  if (process.platform !== 'win32') return async () => {};

  await mkdir(profileDir, { recursive: true });
  const canonical = (await realpath(profileDir)).toLowerCase();
  const key = createHash('sha256').update(canonical).digest('hex');
  const pipe = `\\\\.\\pipe\\shopee-mcp-profile-${key}`;
  const server = createServer((socket) => socket.destroy());
  await new Promise<void>((resolve, reject) => {
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        reject(
          new Error(
            'Shopee browser profile is already in use by another MCP or login process. ' +
              'Use one Shopee MCP instance per profile; another launch was prevented.',
          ),
        );
      } else {
        reject(error);
      }
    });
    server.listen(pipe, resolve);
  });
  server.unref();
  let releasePromise: Promise<void> | undefined;
  return () => {
    releasePromise ??= new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    return releasePromise;
  };
}
