import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initialTexts = [
  // Navigation
  { key: "nav.products", group: "navigation", label: "Navigasiya — Məhsullar", valueAz: "Məhsullar", valueEn: "Products", valueRu: "Товары" },
  { key: "nav.categories", group: "navigation", label: "Navigasiya — Kateqoriyalar", valueAz: "Kateqoriyalar", valueEn: "Categories", valueRu: "Категории" },
  { key: "nav.brands", group: "navigation", label: "Navigasiya — İstehsalçılar", valueAz: "İstehsalçılar", valueEn: "Brands", valueRu: "Производители" },
  { key: "nav.campaigns", group: "navigation", label: "Navigasiya — Kampaniyalar", valueAz: "Kampaniyalar", valueEn: "Campaigns", valueRu: "Кампании" },
  { key: "nav.stores", group: "navigation", label: "Navigasiya — Mağazalar", valueAz: "Mağazalar", valueEn: "Stores", valueRu: "Магазины" },
  { key: "nav.agronom", group: "navigation", label: "Navigasiya — AI Aqronom", valueAz: "AI Aqronom", valueEn: "AI Agronomist", valueRu: "AI Агроном" },
  { key: "nav.blog", group: "navigation", label: "Navigasiya — Bloq", valueAz: "Bloq", valueEn: "Blog", valueRu: "Блог" },
  { key: "nav.new_ad", group: "navigation", label: "Navigasiya — Yeni Elan Düyməsi", valueAz: "Yeni Elan", valueEn: "New Listing", valueRu: "Новое объявление" },
  { key: "nav.city", group: "navigation", label: "Navigasiya — Şəhər", valueAz: "Şəhər", valueEn: "City", valueRu: "Город" },
  { key: "nav.search_placeholder", group: "navigation", label: "Navigasiya — Axtarış placeholder", valueAz: "Məhsul, toxum, kimyəvi preparat və ya xəstəlik axtarın...", valueEn: "Search products, seeds, chemicals or diseases...", valueRu: "Поиск товаров, семян, химикатов или болезней..." },
  { key: "nav.home", group: "navigation", label: "Aşağı Navigasiya — Əsas", valueAz: "Əsas", valueEn: "Home", valueRu: "Главная" },
  { key: "nav.favorites", group: "navigation", label: "Aşağı Navigasiya — Seçilmiş", valueAz: "Seçilmiş", valueEn: "Favorites", valueRu: "Izbrannoe" },
  { key: "nav.messages", group: "navigation", label: "Aşağı Navigasiya — Mesajlar", valueAz: "Mesajlar", valueEn: "Messages", valueRu: "Сообщения" },
  { key: "nav.profile", group: "navigation", label: "Aşağı Navigasiya — Profil", valueAz: "Profil", valueEn: "Profile", valueRu: "Профиль" },
  { key: "nav.catalog", group: "navigation", label: "Aşağı Navigasiya — Kataloq", valueAz: "Kataloq", valueEn: "Catalog", valueRu: "Каталог" },
  { key: "nav.login", group: "navigation", label: "Aşağı Navigasiya — Giriş", valueAz: "Giriş", valueEn: "Login", valueRu: "Войти" },
  { key: "nav.sell", group: "navigation", label: "Aşağı Navigasiya — Sat düyməsi", valueAz: "Sat", valueEn: "Sell", valueRu: "Продать" },

  // Homepage
  { key: "home.hero.title", group: "homepage", label: "Ana Səhifə — Hero Başlıq", valueAz: "Sən də əkin, sat, qazan!", valueEn: "Plant, sell, earn!", valueRu: "Сажайте, продавайте, зарабатывайте!" },
  { key: "home.hero.subtitle", group: "homepage", label: "Ana Səhifə — Hero Alt Başlıq", valueAz: "Azərbaycanın ilk və ən böyük aqrar marketplace platforması", valueEn: "Azerbaijan's first and largest agricultural marketplace platform", valueRu: "Первая и крупнейшая аграрная маркетплейс платформа Азербайджана" },
  { key: "home.search.placeholder", group: "homepage", label: "Ana Səhifə — Hero Axtarış Placeholder", valueAz: "Nə axtarırsınız? (məs: Pomidor toxumu)", valueEn: "What are you looking for? (e.g. Tomato seeds)", valueRu: "Что вы ищете? (например: Семена томатов)" },
  { key: "home.search.button", group: "homepage", label: "Ana Səhifə — Hero Axtarış Düyməsi", valueAz: "Axtar", valueEn: "Search", valueRu: "Искать" },
  { key: "home.search.trending", group: "homepage", label: "Ana Səhifə — Trend Axtarışlar Başlığı", valueAz: "Trend Axtarışlar", valueEn: "Trending Searches", valueRu: "Популярные запросы" },
  { key: "home.stats.title", group: "homepage", label: "Ana Səhifə — Statistika Başlığı", valueAz: "Niyə FermerMarket?", valueEn: "Why FermerMarket?", valueRu: "Почему FermerMarket?" },
  { key: "home.stats.subtitle", group: "homepage", label: "Ana Səhifə — Statistika Alt Başlığı", valueAz: "Azərbaycanlı fermerlər bizi seçir", valueEn: "Azerbaijani farmers choose us", valueRu: "Азербайджанские фермеры выбирают нас" },
  { key: "home.stats.active_ads", group: "homepage", label: "Ana Səhifə — Statistika Aktiv Elan", valueAz: "Aktiv Elan", valueEn: "Active Ads", valueRu: "Активные объявления" },
  { key: "home.stats.farmers", group: "homepage", label: "Ana Səhifə — Statistika Fermer", valueAz: "Fermer", valueEn: "Farmers", valueRu: "Фермеры" },
  { key: "home.stats.stores", group: "homepage", label: "Ana Səhifə — Statistika Mağaza", valueAz: "Mağaza", valueEn: "Stores", valueRu: "Магазины" },
  { key: "home.stats.satisfied", group: "homepage", label: "Ana Səhifə — Statistika Məmnun İstifadəçi", valueAz: "Məmnun İstifadəçi", valueEn: "Satisfied Users", valueRu: "Довольные пользователи" },
  { key: "home.agronom.tag", group: "homepage", label: "Ana Səhifə — AI Aqronom Tag", valueAz: "AI ilə işləyir", valueEn: "Powered by AI", valueRu: "Работает на ИИ" },
  { key: "home.agronom.title", group: "homepage", label: "Ana Səhifə — AI Aqronom Başlıq", valueAz: "AI Aqronom", valueEn: "AI Agronomist", valueRu: "AI Агроном" },
  { key: "home.agronom.description", group: "homepage", label: "Ana Səhifə — AI Aqronom Təsviri", valueAz: "Bitkinizdə xəstəlik var? Şəkil göndərin, AI analiz etsin. Torpaq, məhsul, iqlim haqqında sual verin.", valueEn: "Has your plant got a disease? Send a photo for AI analysis.", valueRu: "Болезнь у растения? Отправьте фото для ИИ анализа." },
  { key: "home.agronom.btn_photo", group: "homepage", label: "Ana Səhifə — AI Aqronom Şəkil Düyməsi", valueAz: "Şəkil Göndər", valueEn: "Send Photo", valueRu: "Отправить фото" },
  { key: "home.agronom.btn_ask", group: "homepage", label: "Ana Səhifə — AI Aqronom Sual Düyməsi", valueAz: "Sual Ver", valueEn: "Ask Question", valueRu: "Задать вопрос" },
  { key: "home.categories.title", group: "homepage", label: "Ana Səhifə — Kateqoriyalar Bölməsi Başlığı", valueAz: "Kateqoriyalar", valueEn: "Categories", valueRu: "Категории" },
  { key: "home.premium.title", group: "homepage", label: "Ana Səhifə — Premium Elanlar Başlığı", valueAz: "Premium Elanlar", valueEn: "Premium Ads", valueRu: "Премиум объявления" },
  { key: "home.latest.title", group: "homepage", label: "Ana Səhifə — Yeni Elanlar Başlığı", valueAz: "Yeni Elanlar", valueEn: "New Listings", valueRu: "Новые объявления" },
  { key: "home.bundles.title", group: "homepage", label: "Ana Səhifə — Bağlamalar Başlığı", valueAz: "Bağlamalar", valueEn: "Bundles", valueRu: "Пакеты" },
  { key: "home.blog.title", group: "homepage", label: "Ana Səhifə — Bloq Bölməsi Başlığı", valueAz: "Fermer Məsləhətləri", valueEn: "Farmer Tips", valueRu: "Советы фермеру" },
  { key: "home.blog.subtitle", group: "homepage", label: "Ana Səhifə — Bloq Alt Başlıq", valueAz: "Kənd təsərrüfatı haqqında faydalı məqalələr", valueEn: "Useful articles about agriculture", valueRu: "Полезные статьи о сельском хозяйстве" },
  { key: "home.blog.read_more", group: "homepage", label: "Ana Səhifə — Bloq Hamısına Bax Düyməsi", valueAz: "Hamısı", valueEn: "View All", valueRu: "Все" },

  // Footer
  { key: "footer.about_title", group: "footer", label: "Footer — Haqqında Başlıq", valueAz: "FermerMarket haqqında", valueEn: "About FermerMarket", valueRu: "О FermerMarket" },
  { key: "footer.about_desc", group: "footer", label: "Footer — Haqqında Mətn", valueAz: "Azərbaycanın ilk və ən böyük aqrar marketplace platforması. Kənd təsərrüfatı məhsullarının onlayn satışı və alışı.", valueEn: "Azerbaijan's first agricultural marketplace.", valueRu: "Первый аграрный маркетплейс Азербайджана." },
  { key: "footer.col_products", group: "footer", label: "Footer — Məhsullar Sütun Başlığı", valueAz: "Məhsullar", valueEn: "Products", valueRu: "Товары" },
  { key: "footer.col_company", group: "footer", label: "Footer — Şirkət Sütun Başlığı", valueAz: "Şirkət", valueEn: "Company", valueRu: "Компания" },
  { key: "footer.col_contact", group: "footer", label: "Footer — Əlaqə Sütun Başlığı", valueAz: "Əlaqə", valueEn: "Contact", valueRu: "Контакты" },
  { key: "footer.copyright", group: "footer", label: "Footer — Müəllif Hüquqları Mətni", valueAz: "Bütün hüquqlar qorunur.", valueEn: "All rights reserved.", valueRu: "Все права защищены." },

  // Products Page
  { key: "products.page_title", group: "products", label: "Məhsullar Səhifəsi — Başlıq", valueAz: "Bütün Elanlar", valueEn: "All Listings", valueRu: "Все объявления" },
  { key: "products.search_results", group: "products", label: "Məhsullar Səhifəsi — Axtarış Nəticələri Mətni", valueAz: "üzrə axtarış nəticələri", valueEn: "search results for", valueRu: "результаты поиска по" },
  { key: "products.empty_title", group: "products", label: "Məhsullar Səhifəsi — Boş Nəticə Başlığı", valueAz: "Heç bir elan tapılmadı", valueEn: "No listings found", valueRu: "Объявления не найдены" },
  { key: "products.empty_desc", group: "products", label: "Məhsullar Səhifəsi — Boş Nəticə Təsviri", valueAz: "Axtarış parametrlərini dəyişərək yenidən cəhd edin.", valueEn: "Try changing your search parameters.", valueRu: "Попробуйте изменить параметры поиска." },
  { key: "products.filter_title", group: "products", label: "Məhsullar Səhifəsi — Filtr Başlığı", valueAz: "Filtrlər", valueEn: "Filters", valueRu: "Фильтры" },

  // Stores Page
  { key: "stores.page_title", group: "stores", label: "Mağazalar Səhifəsi — Başlıq", valueAz: "Rəsmi Mağazalar", valueEn: "Official Stores", valueRu: "Официальные магазины" },
  { key: "stores.subtitle", group: "stores", label: "Mağazalar Səhifəsi — Alt Başlıq", valueAz: "Kənd təsərrüfatı texnikası, toxum, gübrə və aqro-kimya mağazaları", valueEn: "Agricultural equipment, seed, fertilizer and agro-chemical stores", valueRu: "Магазины сельхозтехники, семян и удобрений" },

  // Blog Page
  { key: "blog.page_title", group: "blog", label: "Bloq Səhifəsi — Başlıq", valueAz: "Fermer Məsləhətləri və Aqro Bloq", valueEn: "Farmer Advice & Agro Blog", valueRu: "Советы фермеру и Агро блог" },
  { key: "blog.subtitle", group: "blog", label: "Bloq Səhifəsi — Alt Başlıq", valueAz: "Kənd təsərrüfatı, əkinçilik, heyvandarlıq və yeni texnologiyalar haqqında faydalı məqalələr", valueEn: "Useful articles about agriculture, farming and livestock", valueRu: "Полезные статьи о сельском хозяйстве и животноводстве" },
];

async function seed() {
  console.log("Seeding SiteText entries...");
  let count = 0;
  for (const item of initialTexts) {
    await prisma.siteText.upsert({
      where: { key: item.key },
      create: item,
      update: {
        label: item.label,
        group: item.group,
        valueAz: item.valueAz,
        valueEn: item.valueEn,
        valueRu: item.valueRu,
      },
    });
    count++;
  }
  console.log(`Successfully seeded ${count} SiteText entries!`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  // ===== LOGIN PAGE =====
  { key: "login.title", group: "auth", label: "Giriş — Səhifə Başlığı", valueAz: "FermerMarket", valueEn: "FermerMarket", valueRu: "FermerMarket" },
  { key: "login.subtitle", group: "auth", label: "Giriş — Alt Başlıq", valueAz: "Kabinetinizə daxil olun", valueEn: "Sign in to your account", valueRu: "Войдите в личный кабинет" },
  { key: "login.label_login", group: "auth", label: "Giriş — Login Etiketi", valueAz: "Giriş (E-poçt, telefon və ya istifadəçi adı)", valueEn: "Login (Email, phone or username)", valueRu: "Вход (Email, телефон или имя пользователя)" },
  { key: "login.placeholder_login", group: "auth", label: "Giriş — Login Placeholder", valueAz: "Nümunə: 0501234567, email, və s.", valueEn: "Example: 0501234567, email, etc.", valueRu: "Пример: 0501234567, email и т.д." },
  { key: "login.label_password", group: "auth", label: "Giriş — Şifrə Etiketi", valueAz: "Şifrə", valueEn: "Password", valueRu: "Пароль" },
  { key: "login.forgot", group: "auth", label: "Giriş — Şifrəni unutdum", valueAz: "Şifrəni unutdum?", valueEn: "Forgot password?", valueRu: "Забыли пароль?" },
  { key: "login.button", group: "auth", label: "Giriş — Düymə", valueAz: "Daxil ol", valueEn: "Sign in", valueRu: "Войти" },
  { key: "login.register_link", group: "auth", label: "Giriş — Qeydiyyat Linki", valueAz: "Qeydiyyat", valueEn: "Register", valueRu: "Регистрация" },
  { key: "login.register_text", group: "auth", label: "Giriş — Hesabınız yoxdur mətni", valueAz: "Hesabınız yoxdur?", valueEn: "Don't have an account?", valueRu: "Нет аккаунта?" },
  { key: "login.error_generic", group: "auth", label: "Giriş — Ümumi xəta", valueAz: "Giriş mümkün olmadı", valueEn: "Login failed", valueRu: "Не удалось войти" },
  { key: "login.error_db", group: "auth", label: "Giriş — DB xətası", valueAz: "Sunucu bağlantısı hatası. Lütfen yöneticinizle iletişime geçin.", valueEn: "Server connection error. Please contact your administrator.", valueRu: "Ошибка подключения к серверу. Обратитесь к администратору." },
  { key: "common.loading", group: "common", label: "Ümumi — Yüklənir", valueAz: "Yüklənir...", valueEn: "Loading...", valueRu: "Загрузка..." },

  // ===== REGISTER PAGE =====
  { key: "register.title", group: "auth", label: "Qeydiyyat — Səhifə Başlığı", valueAz: "Qeydiyyat", valueEn: "Register", valueRu: "Регистрация" },
  { key: "register.subtitle", group: "auth", label: "Qeydiyyat — Alt Başlıq", valueAz: "FermerMarket ailəsinə qoşulun", valueEn: "Join the FermerMarket family", valueRu: "Присоединяйтесь к FermerMarket" },
  { key: "register.label_name", group: "auth", label: "Qeydiyyat — Ad Soyad Etiketi", valueAz: "Ad Soyad", valueEn: "Full Name", valueRu: "Имя Фамилия" },
  { key: "register.label_username", group: "auth", label: "Qeydiyyat — İstifadəçi adı Etiketi", valueAz: "İstifadəçi adı (Login)", valueEn: "Username (Login)", valueRu: "Имя пользователя (Логин)" },
  { key: "register.label_email", group: "auth", label: "Qeydiyyat — Email Etiketi", valueAz: "Email (İstəyə bağlı)", valueEn: "Email (Optional)", valueRu: "Email (необязательно)" },
  { key: "register.label_phone", group: "auth", label: "Qeydiyyat — Telefon Etiketi", valueAz: "Telefon", valueEn: "Phone", valueRu: "Телефон" },
  { key: "register.label_password", group: "auth", label: "Qeydiyyat — Şifrə Etiketi", valueAz: "Şifrə", valueEn: "Password", valueRu: "Пароль" },
  { key: "register.label_password_confirm", group: "auth", label: "Qeydiyyat — Şifrə təkrar Etiketi", valueAz: "Şifrəni təkrarla", valueEn: "Confirm Password", valueRu: "Повторите пароль" },
  { key: "register.button", group: "auth", label: "Qeydiyyat — Düymə", valueAz: "Qeydiyyatdan keç", valueEn: "Sign up", valueRu: "Зарегистрироваться" },
  { key: "register.login_link", group: "auth", label: "Qeydiyyat — Daxil ol Linki", valueAz: "Daxil ol", valueEn: "Sign in", valueRu: "Войти" },
  { key: "register.have_account", group: "auth", label: "Qeydiyyat — Hesabınız var mətni", valueAz: "Hesabınız var?", valueEn: "Already have an account?", valueRu: "Уже есть аккаунт?" },

  // ===== CART PAGE =====
  { key: "cart.title", group: "cart", label: "Səbət — Başlıq", valueAz: "Səbət", valueEn: "Cart", valueRu: "Корзина" },
  { key: "cart.empty_title", group: "cart", label: "Səbət — Boş Başlıq", valueAz: "Səbətiniz boşdur", valueEn: "Your cart is empty", valueRu: "Ваша корзина пуста" },
  { key: "cart.browse_products", group: "cart", label: "Səbət — Elanlara bax", valueAz: "Elanlara bax", valueEn: "Browse listings", valueRu: "Просмотреть объявления" },
  { key: "cart.item_count", group: "cart", label: "Səbət — Məhsul sayı", valueAz: "məhsul", valueEn: "items", valueRu: "товаров" },
  { key: "cart.wholesale_price", group: "cart", label: "Səbət — Topdan qiymət", valueAz: "Topdan qiymət!", valueEn: "Wholesale price!", valueRu: "Оптовая цена!" },
  { key: "cart.total", group: "cart", label: "Səbət — Cəmi", valueAz: "Cəmi", valueEn: "Total", valueRu: "Итого" },
  { key: "cart.checkout", group: "cart", label: "Səbət — Sifarişi tamamla", valueAz: "Sifarişi tamamla", valueEn: "Checkout", valueRu: "Оформить заказ" },

  // ===== CHECKOUT PAGE =====
  { key: "checkout.success_title", group: "checkout", label: "Sifariş — Uğur Başlığı", valueAz: "Sifariş qəbul edildi!", valueEn: "Order received!", valueRu: "Заказ принят!" },
  { key: "checkout.order_number", group: "checkout", label: "Sifariş — Nömrə mətni", valueAz: "Sifariş nömrəniz:", valueEn: "Your order number:", valueRu: "Номер вашего заказа:" },
  { key: "checkout.coin_earned", group: "checkout", label: "Sifariş — Coin mətni", valueAz: "FermerCoin qazandınız. Balansınızı Panelinizdən yoxlaya bilərsiniz.", valueEn: "You earned FermerCoin. Check your balance in your dashboard.", valueRu: "Вы заработали FermerCoin. Проверьте баланс в личном кабинете." },
  { key: "checkout.go_dashboard", group: "checkout", label: "Sifariş — Panelimə keç", valueAz: "Panelimə keç", valueEn: "Go to dashboard", valueRu: "В личный кабинет" },
  { key: "checkout.empty", group: "checkout", label: "Sifariş — Boş səbət", valueAz: "Səbətiniz boşdur.", valueEn: "Your cart is empty.", valueRu: "Ваша корзина пуста." },
  { key: "checkout.title", group: "checkout", label: "Sifariş — Tamamla Başlığı", valueAz: "Sifarişi tamamla", valueEn: "Complete your order", valueRu: "Оформить заказ" },
  { key: "checkout.delivery_info", group: "checkout", label: "Sifariş — Çatdırılma məlumat", valueAz: "Çatdırılma və Ünvan Məlumatları", valueEn: "Delivery and Address Information", valueRu: "Информация о доставке и адресе" },
  { key: "checkout.label_region", group: "checkout", label: "Sifariş — Region etiketi", valueAz: "Region", valueEn: "Region", valueRu: "Регион" },
  { key: "checkout.label_city", group: "checkout", label: "Sifariş — Şəhər etiketi", valueAz: "Şəhər / Qəsəbə", valueEn: "City / Town", valueRu: "Город / Поселок" },
  { key: "checkout.label_delivery", group: "checkout", label: "Sifariş — Çatdırılma üsulu", valueAz: "Çatdırılma üsulu", valueEn: "Delivery method", valueRu: "Способ доставки" },
  { key: "checkout.standard_delivery", group: "checkout", label: "Sifariş — Standart çatdırılma", valueAz: "Standart Çatdırılma", valueEn: "Standard Delivery", valueRu: "Стандартная доставка" },
  { key: "checkout.express_delivery", group: "checkout", label: "Sifariş — Sürətli çatdırılma", valueAz: "Sürətli Çatdırılma", valueEn: "Express Delivery", valueRu: "Экспресс доставка" },
  { key: "checkout.label_coupon", group: "checkout", label: "Sifariş — Kupon etiketi", valueAz: "Kupon kodu (istəyə bağlı)", valueEn: "Coupon code (optional)", valueRu: "Код купона (необязательно)" },
  { key: "checkout.summary", group: "checkout", label: "Sifariş — Xülasə Başlığı", valueAz: "Sifariş Xülasəsi", valueEn: "Order Summary", valueRu: "Сводка заказа" },
  { key: "checkout.subtotal", group: "checkout", label: "Sifariş — Məhsul məbləği", valueAz: "Məhsul məbləği", valueEn: "Subtotal", valueRu: "Сумма товаров" },
  { key: "checkout.delivery_cost", group: "checkout", label: "Sifariş — Çatdırılma xərci", valueAz: "Çatdırılma", valueEn: "Delivery", valueRu: "Доставка" },
  { key: "checkout.place_order", group: "checkout", label: "Sifariş — Sifarişi ver düyməsi", valueAz: "Sifarişi ver", valueEn: "Place order", valueRu: "Оформить" },

  // ===== PRODUCT DETAIL PAGE =====
  { key: "product.inactive_title", group: "product_detail", label: "Məhsul — Aktiv deyil başlıq", valueAz: "Bu elan aktiv deyil", valueEn: "This listing is not active", valueRu: "Это объявление неактивно" },
  { key: "product.inactive_desc", group: "product_detail", label: "Məhsul — Aktiv deyil təsvir", valueAz: "Məhsul satılıb və ya vaxtı bitib. Zəhmət olmasa, aşağıdakı oxşar məhsullara göz atın.", valueEn: "Product is sold or expired. Please check similar products below.", valueRu: "Товар продан или срок истек. Пожалуйста, посмотрите похожие товары ниже." },
  { key: "product.individual_badge", group: "product_detail", label: "Məhsul — Fərdi elan", valueAz: "Fərdi elan", valueEn: "Individual listing", valueRu: "Индивидуальное объявление" },
  { key: "product.description_title", group: "product_detail", label: "Məhsul — Təsvir başlığı", valueAz: "Təsvir", valueEn: "Description", valueRu: "Описание" },
  { key: "product.specs_title", group: "product_detail", label: "Məhsul — Xüsusiyyətlər başlığı", valueAz: "Məhsulun xüsusiyyətləri", valueEn: "Product specifications", valueRu: "Характеристики товара" },
  { key: "product.active_ingredient", group: "product_detail", label: "Məhsul — Aktiv maddə", valueAz: "Aktiv maddə:", valueEn: "Active ingredient:", valueRu: "Действующее вещество:" },
  { key: "product.formulation", group: "product_detail", label: "Məhsul — Preparat forması", valueAz: "Preparat forması:", valueEn: "Formulation:", valueRu: "Форма препарата:" },
  { key: "product.dosage", group: "product_detail", label: "Məhsul — Sərfiyyat norması", valueAz: "Sərfiyyat norması:", valueEn: "Application rate:", valueRu: "Норма расхода:" },
  { key: "product.water_rate", group: "product_detail", label: "Məhsul — Su norması", valueAz: "Su norması:", valueEn: "Water rate:", valueRu: "Норма воды:" },
  { key: "product.waiting_period", group: "product_detail", label: "Məhsul — Gözləmə müddəti", valueAz: "Gözləmə müddəti:", valueEn: "Waiting period:", valueRu: "Период ожидания:" },
  { key: "product.max_application", group: "product_detail", label: "Məhsul — Maksimum tətbiq", valueAz: "Maksimum tətbiq:", valueEn: "Max applications:", valueRu: "Макс. применений:" },
  { key: "product.manufacturer", group: "product_detail", label: "Məhsul — İstehsalçı", valueAz: "İstehsalçı:", valueEn: "Manufacturer:", valueRu: "Производитель:" },
  { key: "product.origin_country", group: "product_detail", label: "Məhsul — İstehsal ölkəsi", valueAz: "İstehsal ölkəsi:", valueEn: "Country of origin:", valueRu: "Страна производства:" },
  { key: "product.applied_plants", group: "product_detail", label: "Məhsul — Tətbiq olunan bitkilər", valueAz: "Tətbiq olunan bitkilər:", valueEn: "Applied plants:", valueRu: "Применяемые растения:" },
  { key: "product.diseases", group: "product_detail", label: "Məhsul — Xəstəliklər", valueAz: "Xəstəliklər:", valueEn: "Diseases:", valueRu: "Болезни:" },
  { key: "product.pests", group: "product_detail", label: "Məhsul — Zərərvericilər", valueAz: "Zərərvericilər:", valueEn: "Pests:", valueRu: "Вредители:" },
  { key: "product.other_for_diseases", group: "product_detail", label: "Məhsul — Xəstəliklərə qarşı digər", valueAz: "Bu Xəstəliklərə Qarşı Digər Dərmanlar", valueEn: "Other medicines for these diseases", valueRu: "Другие препараты от этих болезней" },
  { key: "product.other_for_pests", group: "product_detail", label: "Məhsul — Zərərvericilərə qarşı digər", valueAz: "Bu Zərərvericilərə Qarşı Digər Dərmanlar", valueEn: "Other medicines for these pests", valueRu: "Другие препараты от этих вредителей" },
  { key: "product.seller_info", group: "product_detail", label: "Məhsul — Satıcı haqqında", valueAz: "Satıcı haqqında", valueEn: "About seller", valueRu: "О продавце" },
  { key: "product.view_profile", group: "product_detail", label: "Məhsul — Profilə bax", valueAz: "Profilə bax", valueEn: "View profile", valueRu: "Профиль продавца" },
  { key: "product.seller_other_listings", group: "product_detail", label: "Məhsul — Satıcının digər elanları", valueAz: "Bu satıcının digər elanları:", valueEn: "Other listings from this seller:", valueRu: "Другие объявления продавца:" },
  { key: "product.price_label", group: "product_detail", label: "Məhsul — Qiymət etiketi", valueAz: "Qiymət", valueEn: "Price", valueRu: "Цена" },

  // ===== CONTACT PAGE =====
  { key: "contact.title", group: "contact", label: "Əlaqə — Başlıq", valueAz: "Bizimlə Əlaqə", valueEn: "Contact Us", valueRu: "Свяжитесь с нами" },
  { key: "contact.support_title", group: "contact", label: "Əlaqə — Müştəri xidmətləri", valueAz: "Müştəri Xidmətləri", valueEn: "Customer Support", valueRu: "Служба поддержки" },
  { key: "contact.support_hours", group: "contact", label: "Əlaqə — İş saatları", valueAz: "Həftəiçi: 09:00 - 18:00", valueEn: "Weekdays: 09:00 - 18:00", valueRu: "Будни: 09:00 - 18:00" },
  { key: "contact.email_title", group: "contact", label: "Əlaqə — Email başlığı", valueAz: "Elektron Poçt", valueEn: "Email", valueRu: "Электронная почта" },
  { key: "contact.email_desc", group: "contact", label: "Əlaqə — Email təsvir", valueAz: "Bizə 7/24 yaza bilərsiniz", valueEn: "Write to us 24/7", valueRu: "Пишите нам 24/7" },
  { key: "contact.address", group: "contact", label: "Əlaqə — Ünvan", valueAz: "Bakı şəhəri, Azərbaycan", valueEn: "Baku, Azerbaijan", valueRu: "Баку, Азербайджан" },
  { key: "contact.form_title", group: "contact", label: "Əlaqə — Form başlığı", valueAz: "Bizə Yazın", valueEn: "Write to us", valueRu: "Напишите нам" },
  { key: "contact.label_name", group: "contact", label: "Əlaqə — Ad etiketi", valueAz: "Adınız və Soyadınız", valueEn: "Your full name", valueRu: "Ваше имя и фамилия" },
  { key: "contact.label_subject", group: "contact", label: "Əlaqə — Mövzu etiketi", valueAz: "Mövzu", valueEn: "Subject", valueRu: "Тема" },
  { key: "contact.subject_support", group: "contact", label: "Əlaqə — Texniki dəstək", valueAz: "Texniki dəstək", valueEn: "Technical support", valueRu: "Техническая поддержка" },
  { key: "contact.subject_complaint", group: "contact", label: "Əlaqə — Şikayət", valueAz: "Şikayət", valueEn: "Complaint", valueRu: "Жалоба" },
  { key: "contact.label_message", group: "contact", label: "Əlaqə — Mesaj etiketi", valueAz: "Mesajınız", valueEn: "Your message", valueRu: "Ваше сообщение" },
  { key: "contact.send_button", group: "contact", label: "Əlaqə — Göndər düyməsi", valueAz: "Göndər", valueEn: "Send", valueRu: "Отправить" },

  // ===== ABOUT PAGE =====
  { key: "about.who_title", group: "about", label: "Haqqımızda — Biz Kimik?", valueAz: "Biz Kimik?", valueEn: "Who are we?", valueRu: "Кто мы?" },
  { key: "about.who_desc", group: "about", label: "Haqqımızda — Təsvir", valueAz: "FermerMarket, Azərbaycanda kənd təsərrüfatı sektorunu tamamilə rəqəmsallaşdırmaq və asanlaşdırmaq üçün yaradılmış innovativ aqrar bazardır.", valueEn: "FermerMarket is an innovative agricultural marketplace created to fully digitize and simplify the agricultural sector in Azerbaijan.", valueRu: "FermerMarket — инновационная аграрная платформа, созданная для полной цифровизации и упрощения сельскохозяйственного сектора Азербайджана." },
  { key: "about.innovation_title", group: "about", label: "Haqqımızda — İnnovasiya başlığı", valueAz: "İnnovasiya və Aqrotexnika", valueEn: "Innovation and Agrotechnology", valueRu: "Инновации и Агротехника" },
  { key: "about.mission_title", group: "about", label: "Haqqımızda — Missiya başlığı", valueAz: "Bizim Missiyamız", valueEn: "Our Mission", valueRu: "Наша миссия" },
  { key: "about.mission_subtitle", group: "about", label: "Haqqımızda — Missiya alt başlıq", valueAz: "Niyə FermerMarket-i seçməlisiniz?", valueEn: "Why choose FermerMarket?", valueRu: "Почему стоит выбрать FermerMarket?" },
  { key: "about.feature_compare", group: "about", label: "Haqqımızda — Tərkib müqayisəsi", valueAz: "Tərkib Müqayisəsi", valueEn: "Ingredient Comparison", valueRu: "Сравнение составов" },
  { key: "about.feature_competition", group: "about", label: "Haqqımızda — Açıq rəqabət", valueAz: "Açıq Rəqabət", valueEn: "Open Competition", valueRu: "Открытая конкуренция" },
  { key: "about.feature_ai", group: "about", label: "Haqqımızda — AI Aqronom", valueAz: "AI Aqronom Dəstəyi", valueEn: "AI Agronomist Support", valueRu: "Поддержка AI Агронома" },

  // ===== FAVORITES PAGE =====
  { key: "favorites.title", group: "favorites", label: "Seçilmişlər — Başlıq", valueAz: "Seçilmişlər", valueEn: "Favorites", valueRu: "Избранное" },
  { key: "favorites.empty", group: "favorites", label: "Seçilmişlər — Boş mətn", valueAz: "Hələ seçilmiş məhsul yoxdur", valueEn: "No favorites yet", valueRu: "Пока нет избранного" },

  // ===== MESSAGES PAGE =====
  { key: "messages.title", group: "messages", label: "Mesajlar — Başlıq", valueAz: "Mesajlar", valueEn: "Messages", valueRu: "Сообщения" },
  { key: "messages.empty", group: "messages", label: "Mesajlar — Boş mətn", valueAz: "Hələ mesaj yoxdur", valueEn: "No messages yet", valueRu: "Пока нет сообщений" },

  // ===== DASHBOARD =====
  { key: "dashboard.title", group: "dashboard", label: "Panel — Başlıq", valueAz: "İdarəetmə Paneli", valueEn: "Dashboard", valueRu: "Панель управления" },
  { key: "dashboard.my_orders", group: "dashboard", label: "Panel — Sifarişlərim", valueAz: "Sifarişlərim", valueEn: "My Orders", valueRu: "Мои заказы" },
  { key: "dashboard.my_listings", group: "dashboard", label: "Panel — Elanlarım", valueAz: "Elanlarım", valueEn: "My Listings", valueRu: "Мои объявления" },
  { key: "dashboard.my_store", group: "dashboard", label: "Panel — Mağazam", valueAz: "Mağazam", valueEn: "My Store", valueRu: "Мой магазин" },
  { key: "dashboard.wallet", group: "dashboard", label: "Panel — Pul Kisəm", valueAz: "Pul Kisəm", valueEn: "My Wallet", valueRu: "Мой кошелек" },
  { key: "dashboard.favorites", group: "dashboard", label: "Panel — Seçilmişlər", valueAz: "Seçilmişlər", valueEn: "Favorites", valueRu: "Избранное" },
  { key: "dashboard.agronom", group: "dashboard", label: "Panel — Aqronom", valueAz: "Aqronom", valueEn: "Agronomist", valueRu: "Агроном" },

  // ===== COMMON / SHARED =====
  { key: "common.currency", group: "common", label: "Ümumi — Valyuta", valueAz: "AZN", valueEn: "AZN", valueRu: "AZN" },
  { key: "common.cancel", group: "common", label: "Ümumi — Ləğv et", valueAz: "Ləğv et", valueEn: "Cancel", valueRu: "Отмена" },
  { key: "common.save", group: "common", label: "Ümumi — Yadda saxla", valueAz: "Saxla", valueEn: "Save", valueRu: "Сохранить" },
  { key: "common.delete", group: "common", label: "Ümumi — Sil", valueAz: "Sil", valueEn: "Delete", valueRu: "Удалить" },
  { key: "common.edit", group: "common", label: "Ümumi — Redaktə", valueAz: "Redaktə", valueEn: "Edit", valueRu: "Редактировать" },
  { key: "common.confirm", group: "common", label: "Ümumi — Təsdiq et", valueAz: "Təsdiq", valueEn: "Confirm", valueRu: "Подтвердить" },
  { key: "common.close", group: "common", label: "Ümumi — Bağla", valueAz: "Bağla", valueEn: "Close", valueRu: "Закрыть" },
  { key: "common.search", group: "common", label: "Ümumi — Axtar", valueAz: "Axtar", valueEn: "Search", valueRu: "Поиск" },
  { key: "common.yes", group: "common", label: "Ümumi — Bəli", valueAz: "Bəli", valueEn: "Yes", valueRu: "Да" },
  { key: "common.no", group: "common", label: "Ümumi — Xeyr", valueAz: "Xeyr", valueEn: "No", valueRu: "Нет" },
  { key: "common.back", group: "common", label: "Ümumi — Geri", valueAz: "Geri", valueEn: "Back", valueRu: "Назад" },
  { key: "common.next", group: "common", label: "Ümumi — Növbəti", valueAz: "Növbəti", valueEn: "Next", valueRu: "Далее" },
  { key: "common.submit", group: "common", label: "Ümumi — Təsdiq et düymə", valueAz: "Göndər", valueEn: "Submit", valueRu: "Отправить" },
  { key: "common.required", group: "common", label: "Ümumi — Tələb olunur", valueAz: "Tələb olunur", valueEn: "Required", valueRu: "Обязательно" },
  { key: "common.optional", group: "common", label: "Ümumi — İstəyə bağlı", valueAz: "İstəyə bağlı", valueEn: "Optional", valueRu: "Необязательно" },
