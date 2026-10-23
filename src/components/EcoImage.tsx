import React, { ImgHTMLAttributes, useState } from "react";
import { useEcoMode } from "@/contexts/EcoModeContext";
import { ImageBrokenIcon as ImageBroken, ImageIcon as Image } from "@phosphor-icons/react";

/**
 * Props pour le composant EcoImage
 * 
 * Toutes les propriétés standard du <img> sont supportées,
 * plus des propriétés spécifiques pour le Mode Économie
 */
interface EcoImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /**
   * Couleur de fond du placeholder en Mode Économie (hex, rgb, ou css color)
   * @default "#e5e7eb" (gris clair)
   */
  ecoPlaceholderColor?: string;

  /**
   * Texte à afficher dans le placeholder en Mode Économie
   * @default "Image masquée (Mode Éco)"
   */
  ecoPlaceholderText?: string;

  /**
   * Hauteur du placeholder en Mode Économie (en pixels)
   * @default "200"
   */
  ecoPlaceholderHeight?: number;

  /**
   * Largeur du placeholder en Mode Économie (en pixels)
   * @default "200"
   */
  ecoPlaceholderWidth?: number;

  /**
   * Alternative texte lisible pour l'accessibilité (recommandé)
   */
  alt: string;
}

/**
 * Composant d'image avec support du Mode Économie de Données
 * 
 * En Mode Économie :
 * - Bloque le chargement de l'image
 * - Affiche un placeholder gris avec texte
 * - Réduit la consommation de données
 * 
 * En Mode Normal :
 * - Charge l'image normalement
 * - Toutes les propriétés du <img> sont conservées
 * 
 * @example
 * // Utilisation basique
 * <EcoImage
 *   src="/path/to/large-image.jpg"
 *   alt="Description de l'image"
 *   width={400}
 *   height={300}
 * />
 * 
 * @example
 * // Utilisation avancée avec customisation
 * <EcoImage
 *   src="/path/to/image.png"
 *   alt="Mon image"
 *   width={400}
 *   height={300}
 *   ecoPlaceholderColor="#f3f4f6"
 *   ecoPlaceholderText="Contenu média désactivé"
 *   ecoPlaceholderHeight={300}
 *   ecoPlaceholderWidth={400}
 *   className="rounded-lg shadow-md"
 * />
 */
export const EcoImage = React.forwardRef<HTMLImageElement, EcoImageProps>(
  (
    {
      ecoPlaceholderColor = "#e5e7eb",
      ecoPlaceholderText = "Image masquée (Mode Éco)",
      ecoPlaceholderHeight = 200,
      ecoPlaceholderWidth = 200,
      alt,
      className,
      style,
      onError,
      ...imgProps
    },
    ref,
  ) => {
    const { isEcoMode } = useEcoMode();
    const [imageLoadError, setImageLoadError] = useState(false);

    // Gestion des erreurs de chargement
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setImageLoadError(true);
      onError?.(e);
    };

    // En Mode Économie : afficher un placeholder à la place de l'image
    if (isEcoMode) {
      return (
        <div
          style={{
            width: ecoPlaceholderWidth,
            height: ecoPlaceholderHeight,
            backgroundColor: ecoPlaceholderColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.375rem", // rounded-md equivalent
            flexDirection: "column",
            gap: "0.5rem",
            ...style,
          }}
          className={className}
          role="img"
          aria-label={alt}
        >
          <Image
            weight="duotone"
            style={{
              width: "2rem",
              height: "2rem",
              color: "#9ca3af",
            }}
            aria-hidden="true"
          />
          <p
            style={{
              fontSize: "0.875rem",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
              padding: "0 0.5rem",
            }}
          >
            {ecoPlaceholderText}
          </p>
        </div>
      );
    }

    // Mode Normal : afficher l'image standard
    // En cas d'erreur de chargement, afficher aussi un placeholder
    if (imageLoadError) {
      return (
        <div
          style={{
            width: ecoPlaceholderWidth,
            height: ecoPlaceholderHeight,
            backgroundColor: "#fecaca",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.375rem",
            flexDirection: "column",
            gap: "0.5rem",
            ...style,
          }}
          className={className}
          role="img"
          aria-label={`Erreur : ${alt}`}
        >
          <ImageBroken
            weight="duotone"
            style={{
              width: "2rem",
              height: "2rem",
              color: "#dc2626",
            }}
            aria-hidden="true"
          />
          <p
            style={{
              fontSize: "0.875rem",
              color: "#991b1b",
              textAlign: "center",
              margin: 0,
              padding: "0 0.5rem",
            }}
          >
            Impossible de charger l'image
          </p>
        </div>
      );
    }

    return (
      <img
        ref={ref}
        alt={alt}
        style={style}
        className={className}
        loading="lazy"
        decoding="async"
        onError={handleImageError}
        {...imgProps}
      />
    );
  },
);

EcoImage.displayName = "EcoImage";
