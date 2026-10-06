export const LOCALES = ["ar", "en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ar";

export const LOCALE_LABELS: Record<Locale, string> = {
  ar: "AR",
  en: "EN",
  fr: "FR",
};

export const RTL_LOCALES: Locale[] = ["ar"];

export function isRtl(locale: Locale) {
  return RTL_LOCALES.includes(locale);
}

/** Resolve locale from a URL pathname segment */
export function localeFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  if (seg === "en") return "en";
  if (seg === "fr") return "fr";
  return "ar";
}

/** Get initial locale for server-side rendering */
export function getInitialLocale(headersList: { get(name: string): string | null }): Locale {
  const pathname = headersList.get("x-invoke-path") || "/";
  return localeFromPath(pathname);
}

/** Build path for a given locale */
export function pathForLocale(locale: Locale) {
  if (locale === "ar") return "/";
  return `/${locale}`;
}

/* ───── Translation keys ───── */

export const translations = {
  // Ticker
  "ticker.text": {
    ar: "مجموعة جديدة • أكتوبر 2026 • أنماط مختارة بعناية •",
    en: "New Collection • October 2026 • Handpicked Styles •",
    fr: "Nouvelle Collection • Octobre 2026 • Styles Triés •",
  },
  // Admin sign in
  "admin.signin.badge": {
    ar: "خاص",
    en: "Private",
    fr: "Privé",
  },
  "admin.signin.title": {
    ar: "مرحباً بعودتك",
    en: "Welcome back",
    fr: "Bon retour",
  },
  "admin.signin.subtitle": {
    ar: "أدخل رمز الإدارة لفتح لوحة التحكم.",
    en: "Enter your admin code to open the back office.",
    fr: "Saisissez votre code admin pour ouvrir le back-office.",
  },
  "admin.signin.code": {
    ar: "رمز الإدارة",
    en: "Admin code",
    fr: "Code admin",
  },
  "admin.signin.submit": {
    ar: "دخول",
    en: "Unlock",
    fr: "Entrer",
  },
  "admin.signin.checking": {
    ar: "جارٍ التحقق…",
    en: "Checking…",
    fr: "Vérification…",
  },
  "admin.signin.wrong": {
    ar: "الرمز غير صحيح",
    en: "Wrong code",
    fr: "Code incorrect",
  },
  "admin.signin.locked": {
    ar: "محاولات كثيرة. حاول مرة أخرى لاحقاً.",
    en: "Too many attempts. Try again later",
    fr: "Trop de tentatives. Réessayez plus tard.",
  },
  "admin.signin.unconfigured": {
    ar: "لم يتم إعداد تسجيل الدخول على هذا الخادم بعد.",
    en: "Sign in is not set up on this server yet.",
    fr: "La connexion n'est pas encore configurée sur ce serveur.",
  },
  // Order form
  "order.now": {
    ar: "اطلب الآن",
    en: "Order Now",
    fr: "Commander",
  },
  "order.confirm": {
    ar: "تأكيد",
    en: "Confirm",
    fr: "Confirmer",
  },
  "order.placing": {
    ar: "جاري الطلب...",
    en: "Placing...",
    fr: "En cours...",
  },
  "order.placed": {
    ar: "تم تقديم الطلب!",
    en: "Order placed!",
    fr: "Commande passée !",
  },
  "order.name": {
    ar: "الاسم *",
    en: "Name *",
    fr: "Nom *",
  },
  "order.name.placeholder": {
    ar: "اسمك",
    en: "Your name",
    fr: "Votre nom",
  },
  "order.phone": {
    ar: "الهاتف",
    en: "Phone",
    fr: "Téléphone",
  },
  "order.email": {
    ar: "البريد الإلكتروني",
    en: "Email",
    fr: "E-mail",
  },
  "order.size": {
    ar: "المقاس",
    en: "Size",
    fr: "Taille",
  },
  // Detail
  "detail.back": {
    ar: "رجوع",
    en: "Back",
    fr: "Retour",
  },
  // Not Found
  "notfound.title": {
    ar: "الصفحة غير موجودة",
    en: "Page Not Found",
    fr: "Page Non Trouvée",
  },
  "notfound.description": {
    ar: "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    en: "Sorry, the page you're looking for doesn't exist or has been moved.",
    fr: "Désolé, la page que vous recherchez n'existe pas ou a été déplacée.",
  },
  "notfound.back": {
    ar: "العودة للرئيسية",
    en: "Back to Home",
    fr: "Retour à l'Accueil",
  },
  // Validation
  "validation.phone": {
    ar: "يجب أن يبدأ الرقم بـ 05 أو 06 أو 07 ويتكون من 10 أرقام",
    en: "Phone must start with 05, 06, or 07 and be 10 digits",
    fr: "Le téléphone doit commencer par 05, 06 ou 07 et comporter 10 chiffres",
  },
  "validation.email": {
    ar: "يرجى إدخال عنوان بريد إلكتروني صالح",
    en: "Please enter a valid email address",
    fr: "Veuillez entrer une adresse email valide",
  },
  // Order Success
  "order.success.title": {
    ar: "شكراً لاختيارك منتجنا!",
    en: "Thank you for choosing our product!",
    fr: "Merci d'avoir choisi notre produit !",
  },
  "order.success.message": {
    ar: "سيتم التواصل معك قريباً لتأكيد طلبك.",
    en: "You'll be contacted soon to confirm your order.",
    fr: "Vous serez contacté bientôt pour confirmer votre commande.",
  },
  "order.success.close": {
    ar: "إغلاق",
    en: "Close",
    fr: "Fermer",
  },
  // Admin back office
  "admin.logout": {
    ar: "تسجيل الخروج",
    en: "Sign out",
    fr: "Déconnexion",
  },
  "admin.notconfigured.title": {
    ar: "قاعدة بيانات الإدارة غير مهيأة",
    en: "Admin database is not configured",
    fr: "Base admin non configurée",
  },
  "admin.notconfigured.hint": {
    ar: "اضبط SUPABASE_SERVICE_ROLE_KEY على هذا الخادم ثم أعد تحميل الصفحة.",
    en: "Set SUPABASE_SERVICE_ROLE_KEY for this server, then reload this page.",
    fr: "Définissez SUPABASE_SERVICE_ROLE_KEY sur ce serveur, puis rechargez la page.",
  },
  "admin.tabs.orders": {
    ar: "الطلبات",
    en: "Orders",
    fr: "Commandes",
  },
  "admin.tabs.shoes": {
    ar: "الأحذية والمخزون",
    en: "Shoes & stock",
    fr: "Chaussures & stock",
  },
  "admin.orders.empty": {
    ar: "لا توجد طلبات بعد.",
    en: "No orders yet.",
    fr: "Aucune commande pour l'instant.",
  },
  "admin.orders.placed": {
    ar: "التاريخ",
    en: "Placed",
    fr: "Passée le",
  },
  "admin.orders.shoe": {
    ar: "الحذاء",
    en: "Shoe",
    fr: "Chaussure",
  },
  "admin.orders.size": {
    ar: "المقاس",
    en: "Size",
    fr: "Taille",
  },
  "admin.orders.customer": {
    ar: "الزبون",
    en: "Customer",
    fr: "Client",
  },
  "admin.orders.status": {
    ar: "الحالة",
    en: "Status",
    fr: "Statut",
  },
  "admin.orders.actions": {
    ar: "إجراءات",
    en: "Actions",
    fr: "Actions",
  },
  "admin.orders.save": {
    ar: "حفظ",
    en: "Save",
    fr: "Enregistrer",
  },
  "admin.orders.delete": {
    ar: "حذف",
    en: "Delete",
    fr: "Supprimer",
  },
  "admin.orders.confirm": {
    ar: "تأكيد",
    en: "Confirm",
    fr: "Confirmer",
  },
  "admin.orders.keep": {
    ar: "إبقاء",
    en: "Keep",
    fr: "Garder",
  },
  "admin.shoes.add": {
    ar: "إضافة حذاء",
    en: "Add shoe",
    fr: "Ajouter une chaussure",
  },
  "admin.shoes.new": {
    ar: "حذاء جديد",
    en: "New shoe",
    fr: "Nouvelle chaussure",
  },
  "admin.shoes.name": {
    ar: "الاسم",
    en: "Name",
    fr: "Nom",
  },
  "admin.shoes.price": {
    ar: "السعر",
    en: "Price",
    fr: "Prix",
  },
  "admin.shoes.description": {
    ar: "الوصف",
    en: "Description",
    fr: "Description",
  },
  "admin.shoes.itemNumber": {
    ar: "رقم الصنف",
    en: "Item number",
    fr: "Numéro d'article",
  },
  "admin.shoes.itemNumberHint": {
    ar: "رقم الصنف (ثابت، يربط الصور)",
    en: "Item number (fixed, keys the images)",
    fr: "Numéro d'article (fixe, lie les images)",
  },
  "admin.shoes.create": {
    ar: "إنشاء",
    en: "Create",
    fr: "Créer",
  },
  "admin.shoes.cancel": {
    ar: "إلغاء",
    en: "Cancel",
    fr: "Annuler",
  },
  "admin.shoes.saveDetails": {
    ar: "حفظ التفاصيل",
    en: "Save details",
    fr: "Enregistrer",
  },
  "admin.shoes.deleteShoe": {
    ar: "حذف الحذاء",
    en: "Delete shoe",
    fr: "Supprimer",
  },
  "admin.shoes.confirmDelete": {
    ar: "تأكيد الحذف",
    en: "Confirm delete",
    fr: "Confirmer",
  },
  "admin.shoes.sizes": {
    ar: "المقاسات والمخزون",
    en: "Sizes & stock",
    fr: "Tailles & stock",
  },
  "admin.shoes.noSizes": {
    ar: "لا توجد مقاسات بعد.",
    en: "No sizes yet.",
    fr: "Aucune taille pour l'instant.",
  },
  "admin.shoes.sizeLabel": {
    ar: "المقاس (39–45)",
    en: "Size (39–45)",
    fr: "Taille (39–45)",
  },
  "admin.shoes.stockLabel": {
    ar: "المخزون",
    en: "Stock",
    fr: "Stock",
  },
  "admin.shoes.addSize": {
    ar: "إضافة مقاس",
    en: "Add size",
    fr: "Ajouter",
  },
  "admin.shoes.save": {
    ar: "حفظ",
    en: "Save",
    fr: "Enregistrer",
  },
  "admin.shoes.remove": {
    ar: "إزالة",
    en: "Remove",
    fr: "Retirer",
  },
  "admin.shoes.images": {
    ar: "الصور (WebP فقط)",
    en: "Images (WebP only)",
    fr: "Images (WebP uniquement)",
  },
  "admin.shoes.upload": {
    ar: "رفع",
    en: "Upload",
    fr: "Envoyer",
  },
  "admin.shoes.delete": {
    ar: "حذف",
    en: "Delete",
    fr: "Supprimer",
  },
  "admin.shoes.variant.main": {
    ar: "أمامي",
    en: "Front",
    fr: "Avant",
  },
  "admin.shoes.variant.standard": {
    ar: "جانبي",
    en: "Side",
    fr: "Côté",
  },
  "admin.shoes.variant.worn": {
    ar: "مُلبس",
    en: "Worn",
    fr: "Porté",
  },
  "admin.shoes.variant.top": {
    ar: "علوي",
    en: "Top",
    fr: "Dessus",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key][locale];
}
