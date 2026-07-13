import { usePageSEO } from "@/features/seo";

interface PageHeadingProps {
  title: string;
  description: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="container-page py-16 md:py-24">
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold text-foreground">
          {title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
