/**
 * TEMPLATES RÉUTILISABLES - Mode Économie de Données
 * 
 * Snippets prêts à copier-coller pour intégration rapide
 * Adapter les chemins d'imports selon votre structure
 */

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 1 : Image avec fallback
// ═════════════════════════════════════════════════════════════════

export const ImageTemplate = `
import { EcoImage } from "@/components/EcoImage";

interface ImageBlockProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function ImageBlock({ src, alt, width = 400, height = 300 }: ImageBlockProps) {
  return (
    <EcoImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className="rounded-lg shadow-md"
      ecoPlaceholderColor="#f3f4f6"
      ecoPlaceholderText="Contenu visuel désactivé"
    />
  );
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 2 : Carte d'offre d'emploi
// ═════════════════════════════════════════════════════════════════

export const JobCardTemplate = `
import { EcoImage } from "@/components/EcoImage";
import { useConditionalAnimation } from "@/hooks/useEcoMode";

interface JobCardProps {
  title: string;
  company: string;
  image: string;
  location: string;
}

export function JobCard({ title, company, image, location }: JobCardProps) {
  const animStyle = useConditionalAnimation("scaleIn");

  return (
    <div style={animStyle} className="job-card hover:shadow-lg">
      <div className="relative h-32 overflow-hidden">
        <EcoImage
          src={image}
          alt={company}
          width={400}
          height={200}
          ecoPlaceholderText="Logo de l'entreprise"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-gray-600">{company}</p>
        <p className="text-sm text-gray-500">{location}</p>
      </div>
    </div>
  );
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 3 : Galerie d'images
// ═════════════════════════════════════════════════════════════════

export const GalleryTemplate = `
import { EcoImage } from "@/components/EcoImage";

interface GalleryProps {
  images: Array<{ id: string; src: string; alt: string }>;
  columns?: number;
}

export function ImageGallery({ images, columns = 3 }: GalleryProps) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: \`repeat(\${columns}, 1fr)\` }}
    >
      {images.map((image) => (
        <EcoImage
          key={image.id}
          src={image.src}
          alt={image.alt}
          className="w-full h-64 object-cover rounded-lg"
          ecoPlaceholderHeight={256}
          ecoPlaceholderWidth={256}
        />
      ))}
    </div>
  );
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 4 : Vidéo avec fallback
// ═════════════════════════════════════════════════════════════════

export const VideoTemplate = `
import { useEcoMode } from "@/contexts/EcoModeContext";
import { EcoImage } from "@/components/EcoImage";

interface VideoPlayerProps {
  src: string;
  poster: string;
  title: string;
}

export function VideoPlayer({ src, poster, title }: VideoPlayerProps) {
  const { isEcoMode } = useEcoMode();

  if (isEcoMode) {
    return (
      <div className="relative group">
        <EcoImage
          src={poster}
          alt={title}
          width={640}
          height={360}
          className="w-full rounded-lg"
          ecoPlaceholderText="Vidéo masquée"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg group-hover:bg-black/60">
          <svg
            className="w-16 h-16 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <video
      controls
      poster={poster}
      className="w-full rounded-lg"
      style={{ maxHeight: "500px" }}
    >
      <source src={src} type="video/mp4" />
      Votre navigateur ne supporte pas la vidéo
    </video>
  );
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 5 : Composant avec animations conditionnelles
// ═════════════════════════════════════════════════════════════════

export const AnimatedComponentTemplate = `
import { useConditionalAnimation, useEcoAnimations } from "@/hooks/useEcoMode";

interface AnimatedBoxProps {
  title: string;
  children: React.ReactNode;
}

export function AnimatedBox({ title, children }: AnimatedBoxProps) {
  const animStyle = useConditionalAnimation("fadeInUp");
  const shouldDisable = useEcoAnimations();

  return (
    <div
      style={animStyle}
      className={shouldDisable ? "opacity-100" : "animate-fade-in-up"}
    >
      <h2>{title}</h2>
      {children}
    </div>
  );
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 6 : Hook personnalisé pour images conditionnelles
// ═════════════════════════════════════════════════════════════════

export const ConditionalImageHookTemplate = `
import { useEcoMode } from "@/contexts/EcoModeContext";

/**
 * Hook pour retourner l'URL appropriée selon le Mode Économie
 */
export function useImageSource(
  normalUrl: string,
  lowResUrl?: string,
): string {
  const { isEcoMode } = useEcoMode();

  if (isEcoMode && lowResUrl) {
    return lowResUrl;
  }

  return normalUrl;
}

// Usage dans un composant :
export function OptimizedImage() {
  const imageUrl = useImageSource(
    "/images/hero-full.jpg",
    "/images/hero-thumb.jpg"
  );

  return <img src={imageUrl} alt="Hero" />;
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 7 : Iframe avec fallback
// ═════════════════════════════════════════════════════════════════

export const IframeTemplate = `
import { useEcoMode } from "@/contexts/EcoModeContext";

interface EmbedProps {
  src: string;
  title: string;
  fallbackUrl?: string;
}

export function ConditionalIframe({ src, title, fallbackUrl }: EmbedProps) {
  const { isEcoMode } = useEcoMode();

  if (isEcoMode) {
    return (
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p className="text-gray-600 mb-4">Contenu externe désactivé</p>
        {fallbackUrl && (
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Ouvrir dans une nouvelle page
          </a>
        )}
      </div>
    );
  }

  return <iframe src={src} title={title} className="w-full h-96" />;
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 8 : Wrapper Provider pour App.tsx
// ═════════════════════════════════════════════════════════════════

export const AppWrapperTemplate = `
// src/App.tsx

import { EcoModeProvider } from "@/contexts/EcoModeContext";
import { EcoModeRootWrapper } from "@/hooks/useEcoMode";
import "@/styles/eco-mode.css";

// ... autres imports

export function App() {
  return (
    <EcoModeProvider>
      <EcoModeRootWrapper>
        <I18nProvider>
          <CandidateSidebarProvider>
            <Toaster />
            <Routes>
              {/* Vos routes */}
            </Routes>
          </CandidateSidebarProvider>
        </I18nProvider>
      </EcoModeRootWrapper>
    </EcoModeProvider>
  );
}

export default App;
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 9 : Bouton de contrôle personnalisé
// ═════════════════════════════════════════════════════════════════

export const ToggleButtonTemplate = `
import { useEcoMode } from "@/contexts/EcoModeContext";
import { EcoModeAnalytics, formatBytes } from "@/lib/eco-mode-utils";

export function EcoModeToggle() {
  const { isEcoMode, toggleEcoMode } = useEcoMode();
  const stats = EcoModeAnalytics.getStats();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleEcoMode}
        className={\`
          px-4 py-2 rounded-lg font-medium transition-all
          \${isEcoMode
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }
        \`}
      >
        {isEcoMode ? "🌱 Mode Éco Actif" : "📡 Mode Normal"}
      </button>

      {isEcoMode && stats.estimatedBytesSaved > 0 && (
        <span className="text-sm text-gray-600">
          Économie : {formatBytes(stats.estimatedBytesSaved)}
        </span>
      )}
    </div>
  );
}
`;

// ═════════════════════════════════════════════════════════════════
// TEMPLATE 10 : Test unitaire
// ═════════════════════════════════════════════════════════════════

export const TestTemplate = `
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EcoModeProvider, useEcoMode } from "@/contexts/EcoModeContext";

// Test Component
function TestComponent() {
  const { isEcoMode, toggleEcoMode } = useEcoMode();
  return (
    <div>
      <p>{isEcoMode ? "Eco ON" : "Eco OFF"}</p>
      <button onClick={toggleEcoMode}>Toggle</button>
    </div>
  );
}

describe("EcoModeContext", () => {
  it("should initialize from localStorage", () => {
    localStorage.setItem("emploiplus_eco_mode", "true");
    render(
      <EcoModeProvider>
        <TestComponent />
      </EcoModeProvider>
    );
    expect(screen.getByText("Eco ON")).toBeInTheDocument();
  });

  it("should toggle mode", async () => {
    render(
      <EcoModeProvider>
        <TestComponent />
      </EcoModeProvider>
    );
    const button = screen.getByRole("button", { name: "Toggle" });
    
    expect(screen.getByText("Eco OFF")).toBeInTheDocument();
    await userEvent.click(button);
    expect(screen.getByText("Eco ON")).toBeInTheDocument();
  });

  it("should persist to localStorage", async () => {
    render(
      <EcoModeProvider>
        <TestComponent />
      </EcoModeProvider>
    );
    const button = screen.getByRole("button", { name: "Toggle" });
    
    await userEvent.click(button);
    expect(localStorage.getItem("emploiplus_eco_mode")).toBe("true");
  });
});
`;

// ═════════════════════════════════════════════════════════════════
// EXPORT
// ═════════════════════════════════════════════════════════════════

export const TEMPLATES = {
  Image: ImageTemplate,
  JobCard: JobCardTemplate,
  Gallery: GalleryTemplate,
  Video: VideoTemplate,
  AnimatedComponent: AnimatedComponentTemplate,
  ConditionalImageHook: ConditionalImageHookTemplate,
  Iframe: IframeTemplate,
  AppWrapper: AppWrapperTemplate,
  ToggleButton: ToggleButtonTemplate,
  Test: TestTemplate,
};

export default TEMPLATES;
