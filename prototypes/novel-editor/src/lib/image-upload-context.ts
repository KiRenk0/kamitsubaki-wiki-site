import { createContext } from 'react';
import type { ReviewAttachment } from './review-attachments';
import type { ArticleImage } from './article-document';
export type ImageUploadScope = {
  purpose: 'entry' | 'article'; key: string;
  isCurrent: () => boolean;
  lookup: (url: string) => { attachment?: ReviewAttachment; image?: ArticleImage };
  remember: (attachment: ReviewAttachment) => void;
};
export const ImageUploadContext = createContext<ImageUploadScope | null>(null);
