# ADR 0001: Arsitektur Logika Proses Bisnis Frontend (Feature-Driven vs Clean Architecture)

- **Status**: Disetujui (Accepted)
- **Tanggal**: 2026-10-25
- **Pengambil Keputusan**: Frontend & Backend Engineering Team

---

## 1. Konteks dan Masalah

Aplikasi ini adalah frontend boilerplate berbasis **Nuxt 4, Vue 3, Pinia, dan Tailwind CSS 4** yang bertindak sebagai Backend-For-Frontend (BFF) dan portal admin untuk upstream REST API (Go Chi).

Muncul pertimbangan arsitektural: **Apakah logika proses bisnis di sisi frontend perlu menerapkan pola Clean Architecture penuh (Entities, Use Cases, Repository Interfaces, Presenters)?**

Di satu sisi, Clean Architecture menawarkan pemisahan dependensi ketat. Di sisi lain, pada frontend modern (terutama dashboard admin di mana aturan bisnis inti, integritas data, dan transaksi atomik berada di backend), penerapan Clean Architecture penuh sering kali menghasilkan:

- _Over-engineering_ dan lapisan abstraksi yang tidak perlu (indirection).
- Konflik terhadap paradigma reaktivitas native Vue 3 (`ref`, `computed`, Pinia).
- Duplikasi kode DTO, Entity, dan Repository tanpa nilai tambah nyata.

---

## 2. Keputusan yang Disepakati

Disepakati untuk **TIDAK menerapkan Clean Architecture penuh (OOP/Uncle Bob)** di frontend Nuxt. Sebagai gantinya, dibakukan pola **Feature-Driven Pragmatic Architecture** dengan pembagian tanggung jawab sebagai berikut:

```
┌────────────────────────────────────────────────────────┐
│                   Component / View                     │
│    (UI Presentation, User Interaction, Dialogs)        │
└───────────────▲────────────────────────▲───────────────┘
                │                        │
┌───────────────┴───────────────┐ ┌──────┴───────────────┐
│     Zod Form Validation       │ │   Pinia State Store  │
│  (Client Input Constraints)   │ │ (State, Cache, Flow) │
└───────────────────────────────┘ └──────▲───────────────┘
                                         │
                                  ┌──────┴───────────────┐
                                  │   Feature Service    │
                                  │ (Pure HTTP API Calls)│
                                  └──────▲───────────────┘
                                         │
                                  ┌──────┴───────────────┐
                                  │  BFF & Go Chi Backend│
                                  │ (Core Business Rules)│
                                  └──────────────────────┘
```

### 2.1. Pembagian Tanggung Jawab (Separation of Concerns)

1. **Feature Services (`app/features/<feature>/services/`)**:
    - Menangani I/O murni HTTP ke endpoint BFF (`/api/*`).
    - Tidak menyimpan state reaktif.
    - Mengembalikan data ter-typing penuh (`shared/types/`).
2. **Pinia Stores (`app/stores/`)**:
    - Sumber kebenaran tunggal (_single source of truth_) untuk state reaktif, paginasi, filter, dan caching.
    - Mengorkestrasi aksi CRUD dan mutasi data antar komponen.
    - Menyediakan `computed` getters untuk status turunan (misal: `filteredUsers`, `activeUsersCount`).
3. **Zod Validation Schemas (`app/features/<feature>/schemas/`)**:
    - Menjaga kontrak validasi data formulir sebelum dikirim ke backend.
    - Menyelaraskan aturan validasi dengan backend (contoh: aturan password OWASP, format email, batasan panjang).
4. **Pure Functional Domain Helpers (`shared/types/`)**:
    - Menggunakan fungsi murni fungsional (seperti `isSuperAdminUser(user)`), bukan class Entity OOP.

### 2.2. Error Handling & Optimistic Concurrency

- Menggunakan hierarki error terstandarisasi (`ValidationError`, `ConflictError`, `UnauthorizedError`) dari `app/lib/api/errors.ts`.
- Konflik versi konkurensi (HTTP 409) ditangkap secara spesifik untuk memicu dialog resolusi konflik atau reload rekaman.
- Kegagalan sesi (HTTP 401) memicu reset auth store dan pengalihan otomatis ke `/login`.

---

## 3. Konsekuensi

### Positif:

- **Kecepatan Pengembangan (Velocity)**: Struktur ramping, minim boilerplate, mudah dipahami developer baru.
- **Keselarasan Ekosistem Vue**: Memanfaatkan kekuatan Pinia dan Composition API secara natural tanpa adapter buatan.
- **Batas Tanggung Jawab Jelas**: Core business rules (otorisasi RBAC, hashing, integritas DB) tetap terpusat di backend Go Chi, frontend fokus pada presentasi, validasi input, dan user experience.
- **Mudah Diuji**: Service, store, dan schema dapat diuji secara terisolasi menggunakan Vitest.

### Negatif / Hal yang Harus Dihindari:

- Jangan menulis logika mutasi data atau kalkulasi bisnis berat di frontend; delegasikan ke backend.
- Hindari bypass dari komponen langsung ke `apiClient` tanpa melalui store atau service yang terdefinisi.
