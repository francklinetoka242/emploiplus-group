import React from "react";

export default function FloatingBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-brand/30 to-accent/20 blur-3xl opacity-70" />
      <div className="absolute right-10 bottom-10 h-56 w-56 rounded-full bg-gradient-to-tr from-secondary/20 to-brand/10 blur-2xl opacity-60" />
    </div>
  );
}
