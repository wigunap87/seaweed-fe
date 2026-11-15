'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  absoluteUrl,
  fetchImages,
  formatBytes,
  type ImageItem,
} from '@/lib/api';

export default function GalleryPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (next: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchImages(next);
      setItems((prev) => {
        // dedupe agar aman terhadap double-effect di React StrictMode
        const seen = new Set(prev.map((i) => i.filename));
        return [...prev, ...res.items.filter((i) => !seen.has(i.filename))];
      });
      setCursor(res.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat gambar');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Fetch halaman pertama saat mount. Galeri ini client-only (data diambil
    // dari BE), jadi setState di effect memang diperlukan di sini.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(null);
  }, [load]);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Galeri Gambar</h1>
        <Link
          href="/upload"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Upload
        </Link>
      </header>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {initialized && !loading && items.length === 0 && !error && (
        <p className="py-16 text-center text-gray-500">
          Belum ada gambar. Mulai dengan upload gambar pertama.
        </p>
      )}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((img) => (
          <li key={img.filename}>
            <Link
              href={`/images/${img.filename}`}
              className="group block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={absoluteUrl(img.url)}
                  alt={img.filename}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
              <div className="p-2 text-xs text-gray-600">
                {formatBytes(img.size)}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex justify-center">
        {loading && <span className="text-sm text-gray-500">Memuat...</span>}
        {!loading && cursor && (
          <button
            onClick={() => void load(cursor)}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Muat lebih banyak
          </button>
        )}
      </div>
    </main>
  );
}
