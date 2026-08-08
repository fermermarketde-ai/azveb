# FermerMarket.az

> Azərbaycanın fermerləri, kənd təsərrüfatı istehsalçıları, təchizatçıları və alıcılarını bir platformada birləşdirən rəqəmsal kənd təsərrüfatı marketplace sistemi.

**FermerMarket.az** kənd təsərrüfatı məhsullarının, heyvanların, texnikanın, toxumların, gübrələrin, yemlərin və digər aqrar məhsul və xidmətlərin elan və satışını təmin edən müasir marketplace platformasıdır.

Platformanın əsas məqsədi fermerlər, istehsalçılar, alıcılar və aqrar xidmət təminatçıları arasında birbaşa əlaqə yaratmaq, kənd təsərrüfatı bazarını rəqəmsallaşdırmaq və istifadəçilərə əlavə ağıllı alətlər təqdim etməkdir.

---

## Əsas imkanlar

### Marketplace

* Kənd təsərrüfatı məhsullarının elanlaşdırılması
* Məhsul kateqoriyaları
* Məhsul axtarışı
* Filtrləmə və sıralama
* Region üzrə axtarış
* Qiymət aralığı üzrə filtr
* Məhsul vəziyyəti
* Elan detalları
* Satıcı məlumatları
* Elan şəkilləri
* Elan statusları
* Elanların aktiv/deaktiv edilməsi
* Elanların moderasiyası

### Elan paketləri

Kənar istifadəçilər üçün elan yerləşdirmə sistemi:

| Paket         | Müddət | Qiymət |
| ------------- | -----: | -----: |
| Pulsuz elan   |  1 gün |  0 AZN |
| Standart elan | 15 gün |  7 AZN |
| Premium elan  | 30 gün | 10 AZN |

Sistem elan müddətini avtomatik izləyir və müddəti bitmiş elanların statusunu dəyişir.

Ödənişli paketlər gələcəkdə aşağıdakı imkanlarla genişləndirilə bilər:

* Elanı önə çıxarma
* Premium badge
* Ana səhifədə göstərilmə
* Axtarış nəticələrində prioritet
* Daha çox şəkil
* Statistikalar
* Baxış sayının artırılması

---

## AI Aqronom

FermerMarket platformasında istifadəçilərə kənd təsərrüfatı ilə bağlı məlumat təqdim edən AI Aqronom modulu nəzərdə tutulur.

Əsas imkanlar:

* Bitki haqqında suallar
* Xəstəliklərin ilkin analizi
* Zərərvericilər haqqında məlumat
* Gübrələmə tövsiyələri
* Suvarma tövsiyələri
* Əkin planlaşdırılması
* Məhsuldarlıq üzrə məsləhətlər
* Bitki qulluq təqvimi
* Aqrar hesablamalar

AI sistemi istifadəçiyə diaqnoz əvəzinə məlumatlandırıcı və tövsiyə xarakterli cavablar təqdim etməli, kritik hallarda mütəxəssisə müraciət edilməsini tövsiyə etməlidir.

---

## Aqrar kalkulyatorlar

Platformaya müxtəlif kənd təsərrüfatı hesablayıcılarının inteqrasiyası nəzərdə tutulur.

Məsələn:

* Toxum miqdarı kalkulyatoru
* Gübrə miqdarı kalkulyatoru
* Sahə hesablayıcısı
* Məhsuldarlıq hesablaması
* Suvarma hesablayıcısı
* Yem hesablayıcısı
* Xərc və gəlir hesablayıcısı

---

# İstifadəçi sistemi

İstifadəçilər:

* Qeydiyyatdan keçə bilər
* Daxil ola bilər
* Profil yarada bilər
* Elan yerləşdirə bilər
* Elanlarını idarə edə bilər
* Elanlarını redaktə edə bilər
* Elanlarını deaktiv edə bilər
* Elanlarını silə bilər
* Seçilmiş elanları saxlaya bilər
* Satıcı ilə əlaqə saxlaya bilər
* Elanlara baxış statistikasını görə bilər

---

# Elan lifecycle

Elan sistemi aşağıdakı statuslardan istifadə edə bilər:

```text
DRAFT
   ↓
PENDING_PAYMENT
   ↓
PENDING_REVIEW
   ↓
ACTIVE
   ↓
EXPIRED
   ↓
ARCHIVED
```

Moderasiya tələb edən hallarda:

```text
ACTIVE
  ↓
REPORTED
  ↓
UNDER_REVIEW
  ↓
ACTIVE / REJECTED
```

Bu struktur elanların idarə olunmasını və gələcəkdə audit sisteminin qurulmasını asanlaşdırır.

---

# Admin Panel

Admin panel platformanın mərkəzi idarəetmə sistemidir.

### İdarəetmə

* Dashboard
* İstifadəçilər
* Satıcılar
* Elanlar
* Kateqoriyalar
* Regionlar
* Ödənişlər
* Elan paketləri
* Şikayətlər
* Moderasiya
* AI istifadəsi
* Sistem logları
* Bildirişlər
* Parametrlər

### Admin statistikaları

Dashboard üzərindən:

* Ümumi istifadəçi sayı
* Aktiv istifadəçilər
* Ümumi elan sayı
* Aktiv elanlar
* Gözləyən elanlar
* Ödənişlər
* Günlük gəlir
* Aylıq gəlir
* Ən çox baxılan elanlar
* Ən aktiv kateqoriyalar
* Region statistikaları

izlənilə bilər.

---

# Rollar və icazələr

Platforma RBAC prinsipi ilə işləməlidir.

Əsas rollar:

```text
SUPER_ADMIN
ADMIN
MODERATOR
SELLER
USER
```

Hər rol yalnız ona verilmiş resurs və əməliyyatlara giriş əldə etməlidir.

Məsələn:

```text
SUPER_ADMIN
 ├── System Settings
 ├── Users
 ├── Admins
 ├── Payments
 ├── Listings
 └── Audit Logs

ADMIN
 ├── Users
 ├── Listings
 ├── Categories
 └── Reports

MODERATOR
 ├── Listings
 ├── Reports
 └── Moderation

SELLER
 ├── Own Listings
 ├── Profile
 └── Payments

USER
 ├── Browse Listings
 ├── Favorites
 └── Contact Seller
```

---

# Təhlükəsizlik

FermerMarket təhlükəsizlik-first yanaşması ilə hazırlanmalıdır.

Əsas təhlükəsizlik tədbirləri:

* Authentication
* Authorization
* RBAC
* Input validation
* Server-side validation
* Rate limiting
* CSRF qorunması
* XSS qorunması
* SQL Injection qorunması
* Secure HTTP headers
* Password hashing
* Session security
* Token rotation
* File upload validation
* MIME type validation
* Image validation
* API request validation
* Audit logging

İstifadəçi tərəfindən göndərilən məlumatlar heç vaxt birbaşa etibarlı məlumat kimi qəbul edilməməlidir.

---

# Fayl və şəkil sistemi

Elan şəkilləri üçün:

* MIME validation
* File size limit
* Extension validation
* Image dimension validation
* Filename sanitization
* Malware scanning
* Secure storage
* Thumbnail generation

tətbiq olunmalıdır.

Şəkillərin tətbiq serverində uzunmüddətli lokal saxlanılması əvəzinə production mühitində S3-compatible object storage istifadə etmək tövsiyə olunur.

---

# Ödəniş sistemi

Ödəniş infrastrukturu elan paketləri ilə inteqrasiya olunur.

Ödəniş lifecycle:

```text
CREATE ORDER
     ↓
PAYMENT INITIATED
     ↓
PAYMENT PROCESSOR
     ↓
PAYMENT CALLBACK / WEBHOOK
     ↓
VERIFY PAYMENT
     ↓
ACTIVATE PACKAGE
     ↓
ACTIVATE LISTING
```

Ödəniş statusu yalnız istifadəçinin browser-dən göndərdiyi məlumat əsasında dəyişdirilməməlidir.

Webhook server tərəfindən ayrıca yoxlanmalıdır.

---

# Bildiriş sistemi

Platformada gələcəkdə:

* Email
* SMS
* WhatsApp
* Telegram
* Push Notification
* In-app Notification

kanalları dəstəklənə bilər.

Bildiriş nümunələri:

```text
Elan təsdiqləndi
Elanın müddəti bitmək üzrədir
Elanın müddəti bitdi
Ödəniş uğurludur
Ödəniş uğursuz oldu
Yeni mesaj
Elanınız moderasiyaya göndərildi
```

---

# Axtarış sistemi

Marketplace üçün axtarış sistemi aşağıdakı parametrləri dəstəkləməlidir:

* Məhsul adı
* Kateqoriya
* Alt kateqoriya
* Region
* Rayon
* Qiymət
* Vəziyyət
* Satıcı
* Elan tipi

Gələcəkdə:

* Full-text search
* Typo tolerance
* Search suggestions
* Synonyms
* Elasticsearch / OpenSearch

inteqrasiyası əlavə edilə bilər.

---

# Tövsiyə olunan texnologiya arxitekturası

Frontend:

```text
Next.js
React
TypeScript
Tailwind CSS
```

Backend:

```text
Node.js
NestJS / Next.js API
TypeScript
```

Database:

```text
PostgreSQL
Prisma ORM
```

Caching / Queue:

```text
Redis
BullMQ
```

Storage:

```text
S3-compatible Object Storage
```

Authentication:

```text
JWT
OAuth
Google Login
Facebook Login
```

AI:

```text
OpenAI API
```

Infrastructure:

```text
Docker
CI/CD
Reverse Proxy
HTTPS
Monitoring
Logging
```

---

# Tövsiyə olunan arxitektura

```text
                    ┌──────────────────┐
                    │   Web / Mobile   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   API / Backend  │
                    └────────┬─────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌────────────┐      ┌────────────┐     ┌────────────┐
   │ PostgreSQL │      │   Redis    │     │  Storage   │
   └────────────┘      └────────────┘     └────────────┘
          │                  │
          │                  ▼
          │            ┌────────────┐
          │            │ BullMQ     │
          │            └─────┬──────┘
          │                  │
          ▼                  ▼
   ┌─────────────────────────────────────┐
   │          Background Workers         │
   └─────────────────────────────────────┘

                    External Services
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
       Payment            AI              Email/SMS
```

---

# Layihə strukturu

Tövsiyə olunan struktur:

```text
fermermarket/
│
├── app/
├── components/
├── modules/
├── lib/
├── services/
├── hooks/
├── utils/
├── types/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
├── tests/
│
├── docs/
│
├── scripts/
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

Layihənin real repository strukturu bu README-də göstərilən nümunədən fərqlənə bilər. Əsas prinsip modulların bir-birindən asılılığının nəzarətdə saxlanılmasıdır.

---

# Database

Əsas entity-lər:

```text
User
Role
Permission
UserRole

Listing
ListingImage
Category
SubCategory
Location

Package
Subscription
Order
Payment
PaymentTransaction

Favorite
Report
ModerationAction

Notification
Message

AIConversation
AIMessage

AuditLog
SystemSetting
```

Entity əlaqələri database səviyyəsində foreign key və uyğun constraint-lərlə qorunmalıdır.

---

# Environment Variables

Production mühitində secret məlumatlar repository-yə commit edilməməlidir.

`.env.example`:

```env
DATABASE_URL=
DIRECT_URL=

NEXTAUTH_SECRET=
NEXTAUTH_URL=

REDIS_URL=

S3_ENDPOINT=
S3_REGION=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

OPENAI_API_KEY=

PAYMENT_API_KEY=
PAYMENT_SECRET=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

Real `.env` faylı Git repository-yə əlavə edilməməlidir.

---

# Local Development

Repository-ni clone edin:

```bash
git clone <repository-url>
cd fermermarket
```

Dependencies:

```bash
npm install
```

Environment:

```bash
cp .env.example .env
```

Database:

```bash
npx prisma generate
npx prisma migrate dev
```

Development server:

```bash
npm run dev
```

Sonra:

```text
http://localhost:3000
```

ünvanından tətbiqə daxil olmaq mümkündür.

---

# Production

Production deployment zamanı aşağıdakılar yoxlanmalıdır:

* Environment variables
* Database connection
* Database migrations
* Redis
* Object storage
* Payment webhooks
* Email provider
* Domain
* SSL
* Security headers
* Rate limits
* Logging
* Monitoring
* Backup
* Error tracking

Production database migrationları deploy prosesinin idarə olunan hissəsi olmalıdır.

---

# Testing

Layihədə mümkün qədər aşağıdakı test səviyyələri tətbiq olunmalıdır:

```text
Unit Tests
Integration Tests
API Tests
Database Tests
E2E Tests
Security Tests
```

Kritik biznes məntiqi xüsusilə test edilməlidir:

* Elan yaradılması
* Elan müddəti
* Paket aktivləşdirilməsi
* Ödəniş təsdiqi
* Webhook verification
* RBAC
* Moderasiya
* Elan expiration
* İstifadəçi icazələri

---

# Cron / Background Jobs

Avtomatik proseslər background worker və scheduled jobs vasitəsilə idarə oluna bilər.

Məsələn:

```text
Every 5 minutes
    ↓
Expired listings check

Every hour
    ↓
Payment reconciliation

Daily
    ↓
Notification cleanup

Daily
    ↓
Analytics aggregation

Weekly
    ↓
Database maintenance tasks
```

İstifadəçi request-i daxilində uzunmüddətli proseslər icra etməkdən mümkün qədər qaçılmalıdır.

---

# Monitoring və Logging

Production sistemdə:

* Application logs
* API logs
* Authentication logs
* Payment logs
* Security logs
* Error tracking
* Performance monitoring
* Database monitoring

olmalıdır.

Xüsusilə aşağıdakı hadisələr audit edilməlidir:

```text
LOGIN
LOGOUT
PASSWORD_CHANGE
ROLE_CHANGE
LISTING_CREATE
LISTING_UPDATE
LISTING_DELETE
LISTING_APPROVE
LISTING_REJECT
PAYMENT
REFUND
ADMIN_ACTION
```

---

# Backup

Production database üçün:

* Automated backup
* Point-in-time recovery
* Backup retention
* Restore testing

tətbiq edilməlidir.

Backup mövcudluğu təkbaşına kifayət deyil. Backup-dan real restore prosesi də periodik olaraq test edilməlidir.

---

# SEO

Marketplace üçün SEO əsas prioritetlərdən biridir.

Tövsiyə olunan imkanlar:

* Server-side rendering
* Dynamic metadata
* Open Graph
* Twitter/X Cards
* Canonical URLs
* Sitemap
* Robots.txt
* Structured Data
* Product/Offer schema
* Breadcrumb schema
* SEO-friendly URLs

Nümunə:

```text
/elanlar/traktorlar
/elanlar/traktorlar/john-deere-5075
/elanlar/heyvanlar/inək
/elanlar/gubreler/azot-gubresi
```

---

# Performance

Platformanın yüksək trafikə hazırlanması üçün:

* Server-side rendering
* Image optimization
* Lazy loading
* CDN
* Redis caching
* Database indexing
* Pagination
* Cursor pagination where appropriate
* Background jobs
* Query optimization
* API rate limiting

istifadə edilməlidir.

Böyük dataset-lərdə bütün elanların bir request-də qaytarılması qadağan edilməlidir.

---

# API Prinsipləri

API endpoint-ləri:

```text
/api/auth
/api/users
/api/listings
/api/categories
/api/locations
/api/packages
/api/orders
/api/payments
/api/favorites
/api/reports
/api/notifications
/api/ai
/api/admin
```

API-lər üçün:

* Authentication
* Authorization
* Validation
* Rate limiting
* Consistent response format
* Error handling
* Logging

standartlaşdırılmalıdır.

---

# Error Handling

Sistem istifadəçiyə daxili texniki məlumatları göstərməməlidir.

Yanlış:

```text
PrismaClientKnownRequestError:
Unique constraint failed on...
```

Düzgün:

```json
{
  "success": false,
  "message": "Sorğunu icra etmək mümkün olmadı.",
  "code": "REQUEST_FAILED"
}
```

Server loglarında isə texniki error tam saxlanıla bilər.

---

# Code Quality

Layihədə aşağıdakı prinsiplərə riayət edilməlidir:

* TypeScript strict mode
* Clean Architecture prinsipləri
* SOLID
* DRY
* Separation of Concerns
* Modular architecture
* Reusable components
* Strong typing
* Centralized validation
* Centralized error handling
* No duplicated business logic

Business logic UI komponentlərinə yerləşdirilməməlidir.

---

# Git Workflow

Branch strukturu:

```text
main
develop
feature/*
fix/*
hotfix/*
refactor/*
```

Commit nümunələri:

```text
feat: add listing package system
fix: resolve listing expiration issue
refactor: improve payment architecture
security: harden file upload validation
perf: optimize listing queries
docs: update deployment guide
```

---

# Deployment Checklist

Production-a çıxmazdan əvvəl:

```text
[ ] Environment variables configured
[ ] Database migration completed
[ ] Database backup verified
[ ] Redis configured
[ ] Storage configured
[ ] Payment webhook verified
[ ] Authentication tested
[ ] RBAC tested
[ ] File upload security tested
[ ] API rate limiting enabled
[ ] HTTPS enabled
[ ] Security headers enabled
[ ] SEO verified
[ ] Sitemap generated
[ ] Error monitoring enabled
[ ] Logging enabled
[ ] E2E tests passed
[ ] Production build passed
[ ] Rollback strategy prepared
```

---

# Development Principles

FermerMarket-də yeni modul əlavə edilərkən mövcud sistemin pozulmaması əsas prinsipdir.

Yeni dəyişiklikdən əvvəl:

1. Mövcud arxitektura analiz edilir.
2. Asılılıqlar müəyyən edilir.
3. Database əlaqələri yoxlanılır.
4. API contract-ları yoxlanılır.
5. Mövcud biznes logic analiz edilir.
6. Regression riskləri müəyyən edilir.
7. Dəyişiklik izolyasiya edilmiş şəkildə tətbiq edilir.
8. Testlər icra edilir.
9. Production build yoxlanılır.
10. Deployment-dan əvvəl rollback planı hazırlanır.

Heç bir yeni modul mövcud funksionallığı səbəbsiz şəkildə dəyişdirməməlidir.

---

# Roadmap

### Phase 1 — Core Marketplace

* [ ] Project foundation
* [ ] Authentication
* [ ] User profiles
* [ ] Categories
* [ ] Listings
* [ ] Search
* [ ] Filters
* [ ] Favorites
* [ ] Admin panel

### Phase 2 — Monetization

* [ ] Free listings
* [ ] 15-day package
* [ ] 30-day package
* [ ] Payment integration
* [ ] Payment verification
* [ ] Featured listings
* [ ] Seller statistics

### Phase 3 — AI

* [ ] AI Agronomist
* [ ] AI chat
* [ ] Crop assistance
* [ ] Disease information
* [ ] Fertilizer recommendations
* [ ] Agricultural calculators

### Phase 4 — Communication

* [ ] Internal messaging
* [ ] Notifications
* [ ] Email
* [ ] SMS
* [ ] WhatsApp integration
* [ ] Telegram integration

### Phase 5 — Scale

* [ ] Advanced search
* [ ] Recommendation engine
* [ ] Analytics
* [ ] CDN
* [ ] Advanced caching
* [ ] Observability
* [ ] Mobile application

---

# License

Bu layihənin lisenziyası repository sahibi tərəfindən müəyyən edilir.

Əgər repository private/commercial layihədirsə, mənbə kodunun icazəsiz istifadəsi, kopyalanması və kommersiya məqsədilə yayılması qadağan edilə bilər.

---

# FermerMarket

**Platform:** FermerMarket.az
**Category:** Agricultural Marketplace (SAAS)
**Target Market:** Azerbaijan
**Architecture:** Modular / Scalable / Production-ready
**Primary Language:** Azerbaijani, English, Russian
**Status:** Active Development By Elgun Gasimov

