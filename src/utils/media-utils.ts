/**
 * Converts an image File to WebP format using the Canvas API (client-side only).
 * Falls back to the original file if conversion fails or the file is already optimal.
 */
export async function convertToWebP(file: File, quality = 0.85): Promise<File> {
  // Skip non-image files, already-converted WebP, and GIFs (animated GIFs would break)
  if (!file.type.startsWith('image/') || file.type === 'image/webp' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = document.createElement('img');
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file); // fallback to original
        return;
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // fallback
            return;
          }
          const newName = file.name.replace(/\.[^.]+$/, '.webp');
          const webpFile = new File([blob], newName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fallback on error
    };

    img.src = objectUrl;
  });
}
