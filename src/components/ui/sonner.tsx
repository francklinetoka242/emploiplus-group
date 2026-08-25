import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:border-primary group-[.toaster]:bg-primary group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:text-sm group-[.toaster]:font-medium group-[.toaster]:text-primary-foreground group-[.toaster]:shadow-xl",
          description: "group-[.toast]:text-primary-foreground/80",
          success:
            "group-[.toaster]:border-primary group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground",
          error:
            "group-[.toaster]:border-destructive group-[.toaster]:bg-destructive group-[.toaster]:text-destructive-foreground",
          warning:
            "group-[.toaster]:border-secondary group-[.toaster]:bg-secondary group-[.toaster]:text-secondary-foreground",
          info:
            "group-[.toaster]:border-primary group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground",
          actionButton: "group-[.toast]:bg-primary-foreground group-[.toast]:text-primary",
          cancelButton: "group-[.toast]:bg-primary-foreground/15 group-[.toast]:text-primary-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
