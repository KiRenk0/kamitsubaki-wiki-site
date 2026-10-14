import {workbenchText as t} from '@/lib/workbench-copy';
import { lazy, Suspense, type ComponentProps } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SourceEditorImplementation = lazy(() => import('./source-editor-implementation'));
export function SourceEditor(props: ComponentProps<typeof SourceEditorImplementation>) {
  return <Suspense fallback={<Skeleton className="w-full" style={{ height: props.height || '320px' }} aria-label={t("正在打开源码编辑器")} />}><SourceEditorImplementation {...props} /></Suspense>;
}
