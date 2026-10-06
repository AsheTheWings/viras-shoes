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
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key][locale];
}
