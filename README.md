# SeaweedFS Image Frontend (Next.js)

Galeri gambar: upload (drag & drop + progress), list dengan "muat lebih banyak",
dan halaman detail. Semua data diambil dari backend NestJS (`/api/images`);
frontend tidak pernah berbicara langsung ke SeaweedFS.

## Menjalankan

```bash
npm install
cp .env.example .env.local   # arahkan ke backend
npm run dev                  # http://localhost:3000
```

### Environment

| Variabel | Default | Keterangan |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Base URL backend. **Di-inline saat build**, jadi harus diset sebelum `npm run build` (bukan hanya saat runtime) |

## Halaman

| Route | Isi |
|---|---|
| `/` | Galeri (grid, lazy load, cursor pagination) |
| `/upload` | Form upload: drag & drop, preview, progress bar, validasi tipe/ukuran |
| `/images/[filename]` | Detail: preview, metadata, buka asli, salin link, hapus |

## Struktur

```
lib/api.ts                       # tipe + fetch/upload (XHR untuk progress)
lib/gallery-store.ts             # penanda invalidasi daftar galeri
components/confirm-dialog.tsx    # modal konfirmasi (native <dialog>)
app/page.tsx                     # galeri
app/upload/page.tsx              # upload
app/images/[filename]/page.tsx   # server wrapper + Suspense
app/images/[filename]/image-detail.tsx  # client component (useParams)
```

## Catatan

- Galeri dan upload adalah Client Component yang memanggil BE langsung dari
  browser, sehingga `FRONTEND_ORIGIN` di BE harus memuat origin FE (CORS).
- Halaman detail memakai `useParams`, yang men-suspend saat prerender dengan
  `cacheComponents` aktif — karena itu dibungkus `Suspense` di `page.tsx`.
- Upload memakai `XMLHttpRequest` agar progress bisa ditampilkan.
- Hapus gambar tersedia di halaman detail dan di tiap kartu galeri (tombol kecil
  di pojok kanan atas); memanggil `DELETE /api/images/:filename` dan menghapus
  versi publik sekaligus original di backend.
- Konfirmasi hapus memakai modal `ConfirmDialog` (elemen native `<dialog>`),
  bukan `window.confirm`: tombol Batal, Esc, atau klik backdrop menutup modal.
- Setelah upload/hapus, `lib/gallery-store.ts` ditandai tidak valid
  (`invalidateGallery()`). Galeri berlangganan lewat `useSyncExternalStore` dan
  otomatis mengambil halaman pertama lagi, jadi daftar tetap segar tanpa reload
  penuh. Halaman detail memakai `router.replace('/')` setelah hapus supaya
  tombol Back tidak kembali ke gambar yang sudah dihapus.
- Gambar yang ditampilkan sudah ber-watermark dari backend; tidak ada overlay
  tambahan di FE. Format yang diterima: JPG, PNG, WEBP (GIF tidak didukung
  karena watermark dibakar ke file).

## Docker

`NEXT_PUBLIC_API_URL` harus dikirim sebagai build arg:

```bash
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.domainanda.com -t seaweed-fe .
docker run --rm -p 3000:3000 seaweed-fe
```

Image memakai output `standalone` (`node server.js`).
