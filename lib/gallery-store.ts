// Penanda sederhana bahwa daftar galeri sudah tidak valid (mis. ada gambar
// baru atau gambar dihapus). Galeri berlangganan lewat `useSyncExternalStore`,
// jadi tidak perlu reload halaman penuh untuk melihat data terbaru.

let version = 0;
const listeners = new Set<() => void>();

export function invalidateGallery(): void {
  version += 1;
  for (const listener of listeners) listener();
}

export function subscribeGallery(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getGalleryVersion(): number {
  return version;
}
