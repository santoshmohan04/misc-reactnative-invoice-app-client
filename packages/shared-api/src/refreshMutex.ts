import type { RefreshResult } from './types';

export class RefreshMutex {
  private refreshPromise: Promise<RefreshResult | null> | null = null;

  run(executor: () => Promise<RefreshResult | null>): Promise<RefreshResult | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = executor().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }
}
