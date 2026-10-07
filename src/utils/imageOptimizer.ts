/**
 * Client-Side Image Optimizer
 * Resizes and compresses images using HTML5 Canvas before uploading.
 * Reduces 5MB-15MB mobile photos to ~150KB-300KB (approx 95% reduction),
 * speeding up submission and saving user bandwidth.
 */

export interface OptimizedImageResult {
  base64: string;
  file: File;
  originalSizeKb: number;
  compressedSizeKb: number;
  width: number;
  height: number;
}

export async function optimizeImageFile(
  file: File,
  maxDimension = 1600,
  quality = 0.82
): Promise<OptimizedImageResult> {
  return new Promise((resolve, reject) => {
    // If not an image (e.g. PDF), resolve directly as Base64
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          base64: reader.result as string,
          file,
          originalSizeKb: Math.round(file.size / 1024),
          compressedSizeKb: Math.round(file.size / 1024),
          width: 0,
          height: 0,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Proportional resize if larger than maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const rawBase64 = e.target?.result as string;
          resolve({
            base64: rawBase64,
            file,
            originalSizeKb: Math.round(file.size / 1024),
            compressedSizeKb: Math.round(file.size / 1024),
            width,
            height,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                base64,
                file,
                originalSizeKb: Math.round(file.size / 1024),
                compressedSizeKb: Math.round(file.size / 1024),
                width,
                height,
              });
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.jpg'),
              {
                type: mimeType,
                lastModified: Date.now(),
              }
            );

            resolve({
              base64,
              file: compressedFile,
              originalSizeKb: Math.round(file.size / 1024),
              compressedSizeKb: Math.round(blob.size / 1024),
              width,
              height,
            });
          },
          mimeType,
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
