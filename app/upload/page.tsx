'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { formatBytes, uploadImage } from '@/lib/api';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview dibuat saat file berubah dan object URL-nya dibersihkan saat
  // unmount / ganti file, tanpa setState di dalam effect.
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return setFile(null);
    if (!ALLOWED.includes(f.type)) {
      setFile(null);
      return setError('Format harus JPG, PNG, atau WEBP.');
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      return setError(`Ukuran maksimal ${formatBytes(MAX_BYTES)}.`);
    }
    setFile(f);
  }

  async function submit() {
    if (!file || uploading) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      const res = await uploadImage(file, setProgress);
      router.push(`/images/${res.filename}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal');
      setUploading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl flex-1 p-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Kembali ke galeri
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-semibold">Upload Gambar</h1>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:bg-gray-50'
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="max-h-72 rounded-lg" />
        ) : (
          <>
            <p className="font-medium">
              Seret gambar ke sini atau klik untuk memilih
            </p>
            <p className="mt-1 text-sm text-gray-500">
              JPG, PNG, WEBP — maks. {formatBytes(MAX_BYTES)}
            </p>
          </>
        )}
        <input
          type="file"
          accept={ALLOWED.join(',')}
          className="hidden"
          disabled={uploading}
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </label>

      {file && (
        <p className="mt-3 text-sm text-gray-600">
          {file.name} · {formatBytes(file.size)}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {uploading && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-gray-500">{progress}%</p>
        </div>
      )}

      <button
        onClick={() => void submit()}
        disabled={!file || uploading}
        className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? 'Mengunggah...' : 'Upload'}
      </button>
    </main>
  );
}
