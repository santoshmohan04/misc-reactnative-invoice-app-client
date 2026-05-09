import type { TableHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('min-w-full divide-y divide-gray-200 dark:divide-gray-700', className)} {...props} />;
}
