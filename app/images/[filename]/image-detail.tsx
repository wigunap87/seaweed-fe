'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  absoluteUrl,
  deleteImage,
  fetchImageDetail,
  formatBytes,
  formatDate,
  type ImageDetail,
} from '@/lib/api';

export default function ImageDetailPage() {
  const { filename } = useParams<{ filename: string }>();
  const router = useRouter();
  const [data, setData] = useState<ImageDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!filename) return;
    fetchImageDetail(filename)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Gagal memuat'));
  }, [filename]);

  async function copyLink() {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(absoluteUrl(data.url));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Browser tidak mengizinkan akses clipboard. Salin URL manual.');
    }
  }

  async function handleDelete() {
    if (!data) return;
    if (!window.confirm('Hapus gambar ini? Tindakan tidak bisa dibatalkan.')) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deleteImage(data.filename);
      router.push('/');
      // Paksa galeri mengambil ulang daftar setelah penghapusan.
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menghapus gambar');
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 p-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Kembali ke galeri
      </Link>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {!data && !error && <p className="mt-6 text-gray-500">Memuat...</p>}

      {data && (
        <div className="mt-4 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="overflow-hidden rounded-xl border bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={absoluteUrl(data.url)}
              alt={data.originalName}
              className="mx-auto max-h-[75vh] w-auto object-contain"
            />
          </div>

          <aside className="space-y-4">
            <h1 className="break-words text-xl font-semibold">
              {data.originalName}
            </h1>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Tipe</dt>
                <dd>{data.contentType}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Ukuran</dt>
                <dd>{formatBytes(data.size)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Diunggah</dt>
                <dd>{formatDate(data.lastModified)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">ID file</dt>
                <dd className="break-all font-mono text-xs">{data.filename}</dd>
              </div>
            </dl>

            <div className="flex gap-2 pt-2">
              <a
                href={absoluteUrl(data.url)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
              >
                Buka asli
              </a>
              <button
                onClick={() => void copyLink()}
                className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                {copied ? 'Tersalin ✓' : 'Salin link'}
              </button>
            </div>

            <button
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? 'Menghapus...' : 'Hapus gambar'}
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
