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

/** Build path for a given locale */
export function pathForLocale(locale: Locale) {
  if (locale === "ar") return "/";
  return `/${locale}`;
}

/* ───── Translation keys ───── */

export const translations = {
  // Ticker
  "ticker.text": {
    ar: "مجموعة جديدة • مارس 2026 • أنماط مختارة بعناية •",
    en: "New Collection • March 2026 • Handpicked Styles •",
    fr: "Nouvelle Collection • Mars 2026 • Styles Triés •",
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
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key][locale];
}
