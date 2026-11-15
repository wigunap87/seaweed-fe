export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');

export interface ImageItem {
  filename: string;
  size: number;
  lastModified: string | null;
  url: string; // path relatif dari BE, mis. /api/images/<filename>/file
}

export interface ImageDetail extends ImageItem {
  originalName: string;
  contentType: string;
}

export interface ListResponse {
  items: ImageItem[];
  nextCursor: string | null;
}

export const absoluteUrl = (path: string) => `${API_URL}${path}`;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return Array.isArray(body.message)
      ? body.message.join(', ')
      : (body.message ?? res.statusText);
  } catch {
    return res.statusText || 'Terjadi kesalahan';
  }
}

export async function fetchImages(
  cursor?: string | null,
  limit = 24,
): Promise<ListResponse> {
  const qs = new URLSearchParams({ limit: String(limit) });
  if (cursor) qs.set('cursor', cursor);
  const res = await fetch(`${API_URL}/api/images?${qs}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

export async function fetchImageDetail(filename: string): Promise<ImageDetail> {
  const res = await fetch(
    `${API_URL}/api/images/${encodeURIComponent(filename)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json();
}

interface ApiErrorBody {
  message?: string | string[];
}

// XHR dipakai agar progress upload bisa ditampilkan (fetch belum mendukung
// upload progress di semua browser).
export function uploadImage(
  file: File,
  onProgress: (percent: number) => void,
): Promise<ImageDetail> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/images`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let body: ApiErrorBody | null = null;
      try {
        body = JSON.parse(xhr.responseText) as ApiErrorBody;
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) {
        return resolve(body as unknown as ImageDetail);
      }
      const msg = Array.isArray(body?.message)
        ? body.message.join(', ')
        : (body?.message ?? 'Upload gagal');
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error('Tidak dapat terhubung ke server'));
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}
