export function readableGalleryPhotoName(photo) {
  for (const value of [photo?.title, photo?.name]) {
    const title = String(value || '').trim();
    if (title && !/^[\da-f-]{30,}\.(?:jpe?g|png|webp|gif|avif)$/i.test(title)) return title;
  }
  return '';
}
