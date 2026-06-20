import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "fr" | "en";

type Dict = Record<string, string>;

const FR: Dict = {
  "nav.home": "Accueil",
  "nav.services": "Services",
  "nav.jobs": "Emplois",
  "nav.blog": "Blog",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.admin": "Espace admin",
  "cta.discover": "Découvrir",
  "cta.viewAll": "Voir tout",
  "cta.viewJobs": "Voir les offres",
  "cta.contactUs": "Nous contacter",
  "cta.readMore": "Lire plus",
  "cta.apply": "Postuler",
  "cta.copyLink": "Copier le lien",
  "cta.share": "Partager",
  "common.loading": "Chargement…",
  "common.empty": "Aucun résultat",
  "common.search": "Rechercher",
  "common.signIn": "Se connecter",
  "common.signOut": "Se déconnecter",
  "common.email": "Email",
  "common.password": "Mot de passe",
  "common.name": "Nom",
  "common.phone": "Téléphone",
  "common.subject": "Sujet",
  "common.message": "Message",
  "common.send": "Envoyer",
  "common.publishedOn": "Publié le",
  "home.hero.eyebrow": "Tech · Job Media · Services numériques",
  "home.hero.title": "Construisons votre avenir professionnel et numérique.",
  "home.hero.subtitle":
    "EmploiPlus Group est une entreprise technologique qui diffuse des opportunités professionnelles et publie du contenu média de référence.",
  "home.stats.jobs": "Offres diffusées",
  "home.stats.companies": "Entreprises partenaires",
  "home.stats.readers": "Lecteurs / mois",
  "home.services.title": "Nos services",
  "home.services.subtitle": "Une plateforme pensée pour les entreprises et les talents.",
  "home.jobs.title": "Dernières offres",
  "home.jobs.subtitle": "Trouvez votre prochain poste parmi les opportunités du moment.",
  "home.blog.title": "Du blog",
  "home.blog.subtitle": "Conseils, tendances emploi et insights tech.",
  "jobs.title": "Offres d'emploi",
  "jobs.subtitle": "Diffusion d'opportunités professionnelles vérifiées.",
  "jobs.filter.all": "Tous les contrats",
  "jobs.share.text": "Offre publiée sur EmploiPlus Group",
  "jobs.detail.requirements": "Profil recherché",
  "jobs.detail.howToApply": "Comment postuler",
  "jobs.detail.applyEmail": "Postuler par email",
  "jobs.detail.applyWhatsapp": "Postuler via WhatsApp",
  "jobs.detail.applyExternal": "Postuler sur le site",
  "jobs.geo.near": "Près de vous",
  "jobs.geo.country": "Dans votre pays",
  "jobs.geo.sortedBy": "Trié pour",
  "blog.title": "Blog EmploiPlus",
  "blog.subtitle": "Articles, conseils et actualités.",
  "blog.sidebar.recentJobs": "Offres récentes",
  "blog.sidebar.jobsNear": "Offres près de vous",
  "blog.sidebar.popular": "Articles populaires",
  "blog.sidebar.categories": "Catégories",
  "services.title": "Nos services",
  "services.subtitle": "Solutions tech, diffusion d'offres et contenu média.",
  "about.title": "À propos d'EmploiPlus Group",
  "about.subtitle": "Tech Company · Job Media · Digital Services Platform",
  "contact.title": "Contactez-nous",
  "contact.subtitle": "Une question, un projet ? Écrivez-nous, nous répondons rapidement.",
  "contact.success": "Message envoyé. Merci !",
  "contact.error": "Une erreur est survenue. Réessayez.",
  "footer.tagline": "Tech Company · Job Media · Digital Services",
  "footer.rights": "Tous droits réservés.",
};

const EN: Dict = {
  "nav.home": "Home",
  "nav.services": "Services",
  "nav.jobs": "Jobs",
  "nav.blog": "Blog",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.admin": "Admin",
  "cta.discover": "Discover",
  "cta.viewAll": "View all",
  "cta.viewJobs": "Browse jobs",
  "cta.contactUs": "Contact us",
  "cta.readMore": "Read more",
  "cta.apply": "Apply",
  "cta.copyLink": "Copy link",
  "cta.share": "Share",
  "common.loading": "Loading…",
  "common.empty": "No results",
  "common.search": "Search",
  "common.signIn": "Sign in",
  "common.signOut": "Sign out",
  "common.email": "Email",
  "common.password": "Password",
  "common.name": "Name",
  "common.phone": "Phone",
  "common.subject": "Subject",
  "common.message": "Message",
  "common.send": "Send",
  "common.publishedOn": "Published on",
  "home.hero.eyebrow": "Tech · Job Media · Digital services",
  "home.hero.title": "Building your professional and digital future.",
  "home.hero.subtitle":
    "EmploiPlus Group is a technology company broadcasting professional opportunities and publishing leading media content.",
  "home.stats.jobs": "Jobs broadcast",
  "home.stats.companies": "Partner companies",
  "home.stats.readers": "Readers / month",
  "home.services.title": "Our services",
  "home.services.subtitle": "A platform designed for companies and talent.",
  "home.jobs.title": "Latest jobs",
  "home.jobs.subtitle": "Find your next role among current opportunities.",
  "home.blog.title": "From the blog",
  "home.blog.subtitle": "Tips, job trends and tech insights.",
  "jobs.title": "Job openings",
  "jobs.subtitle": "Curated professional opportunities.",
  "jobs.filter.all": "All contracts",
  "jobs.share.text": "Job posted on EmploiPlus Group",
  "jobs.detail.requirements": "Profile",
  "jobs.detail.howToApply": "How to apply",
  "jobs.detail.applyEmail": "Apply by email",
  "jobs.detail.applyWhatsapp": "Apply via WhatsApp",
  "jobs.detail.applyExternal": "Apply on company site",
  "jobs.geo.near": "Near you",
  "jobs.geo.country": "In your country",
  "jobs.geo.sortedBy": "Sorted for",
  "blog.title": "EmploiPlus Blog",
  "blog.subtitle": "Articles, advice and news.",
  "blog.sidebar.recentJobs": "Recent jobs",
  "blog.sidebar.jobsNear": "Jobs near you",
  "blog.sidebar.popular": "Popular articles",
  "blog.sidebar.categories": "Categories",
  "services.title": "Our services",
  "services.subtitle": "Tech solutions, job broadcasting and media content.",
  "about.title": "About EmploiPlus Group",
  "about.subtitle": "Tech Company · Job Media · Digital Services Platform",
  "contact.title": "Contact us",
  "contact.subtitle": "A question, a project? Write to us — we reply fast.",
  "contact.success": "Message sent. Thank you!",
  "contact.error": "Something went wrong. Try again.",
  "footer.tagline": "Tech Company · Job Media · Digital Services",
  "footer.rights": "All rights reserved.",
};

const DICTS: Record<Locale, Dict> = { fr: FR, en: EN };

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (k: string) => string };
const I18nContext = createContext<Ctx>({ locale: "fr", setLocale: () => {}, t: (k) => k });

function detectInitial(): Locale {
  if (typeof window === "undefined") return "fr";
  try {
    const saved = window.localStorage.getItem("epg.locale") as Locale | null;
    if (saved === "fr" || saved === "en") return saved;
    const nav = (navigator.language || "fr").toLowerCase();
    return nav.startsWith("en") ? "en" : "fr";
  } catch { return "fr"; }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr");
  useEffect(() => { setLocaleState(detectInitial()); }, []);
  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("epg.locale", l);
  };
  const t = (k: string) => DICTS[locale][k] ?? FR[k] ?? k;
  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
