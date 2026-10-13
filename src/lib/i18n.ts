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
export function getInitialLocale(headersList: {
  get(name: string): string | null;
}): Locale {
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
  "shop.load.error": {
    ar: "تعذر تحميل المجموعة",
    en: "The collection couldn’t load",
    fr: "La collection n’a pas pu se charger",
  },
  "shop.load.description": {
    ar: "حاول مرة أخرى أو تواصل معنا للمساعدة.",
    en: "Please try again, or get in touch and we’ll help you find your pair.",
    fr: "Réessayez ou contactez-nous pour trouver votre paire.",
  },
  "shop.retry": { ar: "حاول مجدداً", en: "Try again", fr: "Réessayer" },
  "shop.collection": {
    ar: "المجموعة",
    en: "The collection",
    fr: "La collection",
  },
  "shop.contact": {
    ar: "تواصل معنا",
    en: "Get in touch",
    fr: "Contactez-nous",
  },
  "shop.eyebrow": {
    ar: "حضورك يبدأ بخطوة",
    en: "GOOD SHOES. GREAT DAYS.",
    fr: "LE STYLE COMMENCE ICI.",
  },
  "shop.hero.line1": { ar: "خطوتك.", en: "Your step.", fr: "Votre pas." },
  "shop.hero.line2": {
    ar: "أسلوبك.",
    en: "Your statement.",
    fr: "Votre style.",
  },
  "shop.hero.description": {
    ar: "أحذية مختارة بعناية لإطلالة تشبهك. اكتشف مجموعتنا واختر زوجك المفضل.",
    en: "A considered collection for wherever the day takes you. Find the pair that feels like you.",
    fr: "Une sélection soignée pour vous accompagner au quotidien. Trouvez la paire qui vous ressemble.",
  },
  "shop.explore": {
    ar: "اكتشف المجموعة",
    en: "Explore the collection",
    fr: "Explorer la collection",
  },
  "shop.discover": {
    ar: "اكتشف هذا الحذاء",
    en: "Discover this pair",
    fr: "Découvrir cette paire",
  },
  "shop.featured": {
    ar: "اختيار VIRAS",
    en: "THE VIRAS EDIT",
    fr: "LA SÉLECTION VIRAS",
  },
  "shop.edit": {
    ar: "أحذية تستحق مكانها.",
    en: "Good taste. From the ground up.",
    fr: "Le style, à chaque pas.",
  },
  "shop.edit.description": {
    ar: "اختر أسلوبك ومقاسك. نحن نتولى الباقي.",
    en: "Find your style. Pick your size. Make it yours.",
    fr: "Trouvez votre style. Choisissez votre taille. Faites-en votre paire.",
  },
  "shop.search": {
    ar: "ابحث عن حذاء…",
    en: "Search the collection…",
    fr: "Rechercher une paire…",
  },
  "shop.allSizes": {
    ar: "كل المقاسات",
    en: "All sizes",
    fr: "Toutes les tailles",
  },
  "shop.sort": { ar: "ترتيب حسب", en: "Sort by", fr: "Trier par" },
  "shop.sort.featured": {
    ar: "المختارات",
    en: "Featured",
    fr: "Notre sélection",
  },
  "shop.sort.low": {
    ar: "السعر: من الأقل",
    en: "Price: low to high",
    fr: "Prix croissant",
  },
  "shop.sort.high": {
    ar: "السعر: من الأعلى",
    en: "Price: high to low",
    fr: "Prix décroissant",
  },
  "shop.sort.name": { ar: "الاسم", en: "Name: A–Z", fr: "Nom : A–Z" },
  "shop.favorites": { ar: "المفضلة", en: "Saved pairs", fr: "Mes favoris" },
  "shop.save": {
    ar: "أضف إلى المفضلة",
    en: "Save this pair",
    fr: "Ajouter aux favoris",
  },
  "shop.unsave": {
    ar: "إزالة من المفضلة",
    en: "Remove from saved pairs",
    fr: "Retirer des favoris",
  },
  "shop.results": { ar: "أحذية", en: "pairs", fr: "paires" },
  "shop.empty": {
    ar: "لا توجد أحذية مطابقة",
    en: "No pairs found",
    fr: "Aucune paire trouvée",
  },
  "shop.empty.description": {
    ar: "جرب بحثاً آخر أو اختر مقاساً مختلفاً.",
    en: "Try another search or choose a different size.",
    fr: "Essayez une autre recherche ou une autre taille.",
  },
  "shop.reset": {
    ar: "إزالة الفلاتر",
    en: "Reset filters",
    fr: "Réinitialiser les filtres",
  },
  "shop.available": { ar: "متوفر", en: "In stock", fr: "Disponible" },
  "shop.soldout": {
    ar: "غير متوفر حالياً",
    en: "Currently sold out",
    fr: "Actuellement épuisé",
  },
  "shop.view": {
    ar: "عرض الحذاء",
    en: "Take a closer look",
    fr: "Voir la paire",
  },
  "shop.photo": {
    ar: "صورة المنتج",
    en: "Product photo",
    fr: "Photo du produit",
  },
  "shop.previous": {
    ar: "الصورة السابقة",
    en: "Previous photo",
    fr: "Photo précédente",
  },
  "shop.next": { ar: "الصورة التالية", en: "Next photo", fr: "Photo suivante" },
  "shop.zoom": {
    ar: "تكبير الصورة",
    en: "Enlarge photo",
    fr: "Agrandir la photo",
  },
  "shop.close": { ar: "إغلاق", en: "Close", fr: "Fermer" },
  "shop.share": {
    ar: "مشاركة الحذاء",
    en: "Share this pair",
    fr: "Partager cette paire",
  },
  "shop.copied": { ar: "تم نسخ الرابط", en: "Link copied", fr: "Lien copié" },
  "shop.share.error": {
    ar: "تعذر نسخ الرابط. انسخه من شريط العنوان.",
    en: "Could not copy. Copy the link from your address bar.",
    fr: "Copie impossible. Copiez le lien depuis la barre d’adresse.",
  },
  "shop.description": { ar: "التفاصيل", en: "The details", fr: "Les détails" },
  "shop.help": {
    ar: "هل تحتاج مساعدة في الاختيار؟",
    en: "Need a hand choosing?",
    fr: "Besoin d’un conseil ?",
  },
  "shop.help.description": {
    ar: "تواصل معنا للمساعدة في المقاس أو تفاصيل الحذاء.",
    en: "Talk to us about sizing or any details before you order.",
    fr: "Contactez-nous pour choisir votre taille ou en savoir plus.",
  },
  "shop.call": { ar: "اتصل بنا", en: "Call us", fr: "Appelez-nous" },
  "shop.email": { ar: "راسلنا", en: "Email us", fr: "Écrivez-nous" },
  "shop.footer": {
    ar: "خطوات تستحقها.",
    en: "A good day starts with a good pair.",
    fr: "Une belle journée commence par une belle paire.",
  },
  "shop.follow": {
    ar: "تابعنا",
    en: "Follow us",
    fr: "Suivez-nous",
  },
  "shop.follow.on": {
    ar: "تابعنا على",
    en: "Follow us on",
    fr: "Suivez-nous sur",
  },
  "shop.newTab": {
    ar: "(يفتح في علامة تبويب جديدة)",
    en: "(opens in a new tab)",
    fr: "(s’ouvre dans un nouvel onglet)",
  },
  // Photo sides
  "photo.side.main": { ar: "الجانب الخارجي", en: "Outer side", fr: "Profil extérieur" },
  "photo.side.standard": { ar: "الزوج بزاوية", en: "Pair at an angle", fr: "Paire de trois-quarts" },
  "photo.side.front": { ar: "الأمام", en: "Front", fr: "Avant" },
  "photo.side.back": { ar: "الخلف (الكعب)", en: "Back (heel)", fr: "Arrière (talon)" },
  "photo.side.inner": { ar: "الجانب الداخلي", en: "Inner side", fr: "Profil intérieur" },
  "photo.side.top": { ar: "من الأعلى", en: "Top", fr: "Dessus" },
  "photo.side.sole": { ar: "النعل", en: "Sole", fr: "Semelle" },
  "photo.side.worn": { ar: "عند الارتداء", en: "Worn", fr: "Porté" },
  "shop.skip": {
    ar: "انتقل إلى المجموعة",
    en: "Skip to collection",
    fr: "Aller à la collection",
  },
  "order.choose": {
    ar: "اختر مقاسك",
    en: "Choose your size",
    fr: "Choisissez votre taille",
  },
  "order.selected": {
    ar: "المقاس المختار",
    en: "Selected size",
    fr: "Taille choisie",
  },
  "order.hint": {
    ar: "اختر مقاساً متوفراً للمتابعة.",
    en: "Select an available size to continue.",
    fr: "Choisissez une taille disponible pour continuer.",
  },
  "order.review": { ar: "تفاصيل طلبك", en: "Your order", fr: "Votre commande" },
  "order.contact": {
    ar: "بيانات التواصل",
    en: "Contact details",
    fr: "Vos coordonnées",
  },
  "order.note": {
    ar: "سنؤكد معك التوفر والتوصيل عبر الهاتف أو البريد الإلكتروني.",
    en: "We’ll contact you to confirm availability and delivery details.",
    fr: "Nous vous contacterons pour confirmer la disponibilité et les détails de livraison.",
  },
  "order.contact.required": {
    ar: "أدخل رقم هاتف أو بريداً إلكترونياً لنتمكن من التواصل معك.",
    en: "Add a phone number or email so we can confirm your order.",
    fr: "Ajoutez un téléphone ou un e-mail pour confirmer votre commande.",
  },
  "order.error": {
    ar: "تعذر إرسال الطلب. حاول مرة أخرى.",
    en: "We couldn’t place your order. Please try again.",
    fr: "Impossible de passer la commande. Réessayez.",
  },
  "order.stock.error": {
    ar: "هذا المقاس غير متوفر حالياً. اختر مقاساً آخر.",
    en: "This size is unavailable. Please choose another size.",
    fr: "Cette taille est indisponible. Choisissez une autre taille.",
  },
  "order.continue": {
    ar: "تابع التسوق",
    en: "Continue exploring",
    fr: "Continuer la visite",
  },
  "admin.search": {
    ar: "ابحث عن طلب…",
    en: "Search orders…",
    fr: "Rechercher une commande…",
  },
  "admin.allStatuses": {
    ar: "كل الحالات",
    en: "All statuses",
    fr: "Tous les statuts",
  },
  "admin.units": {
    ar: "إجمالي المخزون",
    en: "Stock units",
    fr: "Unités en stock",
  },
  "admin.lowStock": {
    ar: "مقاسات بمخزون منخفض",
    en: "Sizes running low",
    fr: "Tailles à stock faible",
  },
  "admin.noResults": {
    ar: "لا توجد نتائج",
    en: "No matching orders",
    fr: "Aucune commande correspondante",
  },
  // Ticker
  "ticker.text": {
    ar: "VIRAS • أنماط مختارة بعناية • اختر مقاسك •",
    en: "VIRAS • A considered collection • Find your perfect pair •",
    fr: "VIRAS • Une sélection soignée • Trouvez votre paire •",
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
  "admin.signin.hint": {
    ar: "حتى 8 أحرف أو أرقام لاتينية، مع مراعاة حالة الأحرف.",
    en: "Up to 8 letters or numbers. Case-sensitive.",
    fr: "Jusqu’à 8 lettres ou chiffres. Sensible à la casse.",
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
    ar: "السعر (درهم)",
    en: "Price (MAD)",
    fr: "Prix (MAD)",
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
    fr: "Ajouter la taille",
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
  "admin.shoes.photos": {
    ar: "الصور",
    en: "Photos",
    fr: "Photos",
  },
  "admin.shoes.addPhotos": {
    ar: "إضافة صور",
    en: "Add photos",
    fr: "Ajouter des photos",
  },
  "admin.shoes.uploading": {
    ar: "جارٍ الرفع…",
    en: "Uploading…",
    fr: "Envoi…",
  },
  "admin.shoes.delete": {
    ar: "حذف",
    en: "Delete",
    fr: "Supprimer",
  },
  "admin.title": {
    ar: "لوحة الإدارة",
    en: "Admin",
    fr: "Administration",
  },
  "admin.tabs.social": {
    ar: "التواصل والشبكات",
    en: "Contact & social",
    fr: "Contact & réseaux",
  },
  "admin.orders.status.pending": { ar: "قيد الانتظار", en: "Pending", fr: "En attente" },
  "admin.orders.status.confirmed": { ar: "مؤكد", en: "Confirmed", fr: "Confirmée" },
  "admin.orders.status.shipped": { ar: "تم الشحن", en: "Shipped", fr: "Expédiée" },
  "admin.orders.status.delivered": { ar: "تم التسليم", en: "Delivered", fr: "Livrée" },
  "admin.orders.status.cancelled": { ar: "ملغى", en: "Cancelled", fr: "Annulée" },
  "admin.shoes.sides": {
    ar: "صور كل جانب",
    en: "Photos of each side",
    fr: "Photos de chaque côté",
  },
  "admin.shoes.sidesHint": {
    ar: "صور JPEG أو PNG أو WebP حتى 10 ميغابايت. تُحوَّل تلقائياً إلى WebP. تظهر الصور في المتجر بهذا الترتيب.",
    en: "JPEG, PNG, or WebP up to 10 MB, converted to WebP automatically. The shop shows photos in this order.",
    fr: "JPEG, PNG ou WebP jusqu’à 10 Mo, convertis automatiquement en WebP. La boutique affiche les photos dans cet ordre.",
  },
  "admin.shoes.firstPhoto": {
    ar: "الصورة الرئيسية",
    en: "Cover photo",
    fr: "Photo principale",
  },
  "admin.shoes.emptySide": {
    ar: "لا توجد صورة",
    en: "No photo",
    fr: "Aucune photo",
  },
  "admin.shoes.choosePhoto": {
    ar: "رفع صورة",
    en: "Upload photo",
    fr: "Envoyer une photo",
  },
  "admin.shoes.replacePhoto": {
    ar: "استبدال",
    en: "Replace",
    fr: "Remplacer",
  },
  "admin.shoes.extraPhotos": {
    ar: "صور إضافية",
    en: "Additional photos",
    fr: "Photos supplémentaires",
  },
  "admin.shoes.noExtras": {
    ar: "لا توجد صور إضافية.",
    en: "No additional photos.",
    fr: "Aucune photo supplémentaire.",
  },
  "admin.shoes.uploadedCount": {
    ar: "تم رفع",
    en: "Uploaded",
    fr: "Envoyées",
  },
  "admin.shoes.deleteShoeHint": {
    ar: "يحذف الحذاء ومقاساته وصوره نهائياً.",
    en: "Permanently deletes the shoe, its sizes, and its photos.",
    fr: "Supprime définitivement la chaussure, ses tailles et ses photos.",
  },
  "admin.saved": {
    ar: "تم الحفظ",
    en: "Saved",
    fr: "Enregistré",
  },
  "admin.social.title": {
    ar: "حسابات التواصل الاجتماعي",
    en: "Social media accounts",
    fr: "Comptes de réseaux sociaux",
  },
  "admin.social.hint": {
    ar: "أدخل رابط الصفحة أو اسم المستخدم (@الاسم). لواتساب يمكنك إدخال رقم الهاتف. اترك الحقل فارغاً لإخفائه من المتجر.",
    en: "Enter a profile link or @username. For WhatsApp you can enter a phone number. Leave a field empty to hide it from the shop.",
    fr: "Saisissez un lien de profil ou un @identifiant. Pour WhatsApp, un numéro de téléphone suffit. Laissez un champ vide pour le masquer de la boutique.",
  },
  "admin.settings.save": {
    ar: "حفظ التغييرات",
    en: "Save changes",
    fr: "Enregistrer les modifications",
  },
  "admin.contact.title": {
    ar: "بيانات التواصل",
    en: "Contact details",
    fr: "Coordonnées",
  },
  "admin.contact.hint": {
    ar: "تظهر في قسم التواصل وفي تفاصيل كل حذاء وفي صفحة الخطأ. اترك الحقل فارغاً لإخفائه.",
    en: "Shown in the shop’s contact section, on every product, and on the error page. Leave a field empty to hide it.",
    fr: "Affichées dans la section contact, sur chaque produit et sur la page d’erreur. Laissez un champ vide pour le masquer.",
  },
  "admin.contact.phone": {
    ar: "رقم الهاتف",
    en: "Phone number",
    fr: "Numéro de téléphone",
  },
  "admin.contact.phoneHint": {
    ar: "رقم مغربي مثل 0612345678 أو رقم دولي يبدأ بـ +",
    en: "A Moroccan number such as 0612345678, or an international number starting with +",
    fr: "Un numéro marocain comme 0612345678, ou un numéro international commençant par +",
  },
  "admin.contact.email": {
    ar: "البريد الإلكتروني",
    en: "Email",
    fr: "E-mail",
  },
  "admin.contact.phoneInvalid": {
    ar: "رقم هاتف غير صالح",
    en: "Not a valid phone number",
    fr: "Numéro de téléphone invalide",
  },
  "admin.contact.emailInvalid": {
    ar: "بريد إلكتروني غير صالح",
    en: "Not a valid email address",
    fr: "Adresse e-mail invalide",
  },
  "admin.contact.shownAs": {
    ar: "يظهر هكذا:",
    en: "Shown as",
    fr: "Affiché :",
  },
  "admin.contact.hidden": {
    ar: "مخفي في المتجر",
    en: "Hidden in the shop",
    fr: "Masqué dans la boutique",
  },
  "admin.social.invalid": {
    ar: "رابط أو اسم مستخدم غير صالح لهذه المنصة",
    en: "Not a valid link or username for this platform",
    fr: "Lien ou identifiant invalide pour cette plateforme",
  },
  "admin.social.opens": {
    ar: "يفتح",
    en: "Opens",
    fr: "Ouvre",
  },
  "admin.social.shown": {
    ar: "يظهر في قسم التواصل وتذييل المتجر.",
    en: "Shown in the shop’s contact section and footer.",
    fr: "Affiché dans la section contact et le pied de page de la boutique.",
  },
  // Admin errors
  "admin.error.not_signed_in": {
    ar: "انتهت الجلسة. سجّل الدخول مجدداً.",
    en: "Your session ended. Sign in again.",
    fr: "Votre session a expiré. Reconnectez-vous.",
  },
  "admin.error.not_configured": {
    ar: "قاعدة بيانات الإدارة غير مهيأة على هذا الخادم.",
    en: "Admin database access is not configured on this server.",
    fr: "L’accès à la base admin n’est pas configuré sur ce serveur.",
  },
  "admin.error.name_empty": {
    ar: "أدخل اسماً.",
    en: "Enter a name.",
    fr: "Saisissez un nom.",
  },
  "admin.error.price_invalid": {
    ar: "يجب أن يكون السعر رقماً يساوي 0 أو أكثر.",
    en: "Price must be a number of 0 or more.",
    fr: "Le prix doit être un nombre supérieur ou égal à 0.",
  },
  "admin.error.item_number_invalid": {
    ar: "رقم الصنف يجب أن يكون عدداً صحيحاً موجباً.",
    en: "Item number must be a positive whole number.",
    fr: "Le numéro d’article doit être un entier positif.",
  },
  "admin.error.item_number_taken": {
    ar: "رقم الصنف مستخدم بالفعل.",
    en: "That item number is already used.",
    fr: "Ce numéro d’article est déjà utilisé.",
  },
  "admin.error.stock_invalid": {
    ar: "المخزون يجب أن يكون عدداً صحيحاً يساوي 0 أو أكثر.",
    en: "Stock must be a whole number of 0 or more.",
    fr: "Le stock doit être un entier supérieur ou égal à 0.",
  },
  "admin.error.size_invalid": {
    ar: "المقاس يجب أن يكون عدداً صحيحاً بين 39 و45.",
    en: "Size must be a whole number from 39 to 45.",
    fr: "La taille doit être un entier entre 39 et 45.",
  },
  "admin.error.size_taken": {
    ar: "هذا المقاس موجود بالفعل لهذا الحذاء.",
    en: "That size already exists for this shoe.",
    fr: "Cette taille existe déjà pour cette chaussure.",
  },
  "admin.error.status_invalid": {
    ar: "اختر حالة صالحة.",
    en: "Choose a valid status.",
    fr: "Choisissez un statut valide.",
  },
  "admin.error.shoe_unknown": {
    ar: "هذا الحذاء لم يعد موجوداً. أعد تحميل الصفحة.",
    en: "This shoe no longer exists. Reload the page.",
    fr: "Cette chaussure n’existe plus. Rechargez la page.",
  },
  "admin.error.shoe_has_orders": {
    ar: "لا يمكن حذف حذاء له طلبات. احذف طلباته أولاً أو اترك مخزونه 0.",
    en: "A shoe with orders can’t be deleted. Delete its orders first, or set its stock to 0.",
    fr: "Impossible de supprimer une chaussure qui a des commandes. Supprimez-les d’abord ou mettez son stock à 0.",
  },
  "admin.error.image_missing": {
    ar: "اختر صورة أولاً.",
    en: "Choose a photo first.",
    fr: "Choisissez d’abord une photo.",
  },
  "admin.error.image_too_large": {
    ar: "يجب ألا يتجاوز حجم الصورة 10 ميغابايت.",
    en: "The photo must be 10 MB or smaller.",
    fr: "La photo doit faire 10 Mo maximum.",
  },
  "admin.error.image_invalid": {
    ar: "تعذّر قراءة الصورة. استخدم JPEG أو PNG أو WebP.",
    en: "That photo can’t be read. Use JPEG, PNG, or WebP.",
    fr: "Photo illisible. Utilisez JPEG, PNG ou WebP.",
  },
  "admin.error.image_unknown": {
    ar: "هذه الصورة لم تعد موجودة. أعد تحميل الصفحة.",
    en: "This photo no longer exists. Reload the page.",
    fr: "Cette photo n’existe plus. Rechargez la page.",
  },
  "admin.error.fields_invalid": {
    ar: "صحّح الحقول المحددة ثم احفظ مجدداً.",
    en: "Fix the highlighted fields, then save again.",
    fr: "Corrigez les champs signalés, puis enregistrez à nouveau.",
  },
  "admin.error.failed": {
    ar: "تعذّر تنفيذ العملية. حاول مجدداً.",
    en: "Something went wrong. Try again.",
    fr: "Échec de l'opération. Réessayez.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key][locale];
}
