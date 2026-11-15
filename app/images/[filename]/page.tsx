import { Suspense } from 'react';
import ImageDetailClient from './image-detail';

export default function ImageDetailPage() {
  // `useParams` di Client Component men-suspend saat param belum diketahui
  // ketika prerender (Cache Components), jadi butuh Suspense boundary.
  return (
    <Suspense
      fallback={<p className="mx-auto max-w-4xl p-6 text-gray-500">Memuat...</p>}
    >
      <ImageDetailClient />
    </Suspense>
  );
}
