export function openMaelise(prefillText?: string): void {
  if (prefillText !== undefined) {
    window.dispatchEvent(new CustomEvent("maelise:prefill", { detail: prefillText }));
  }

  const triggers = Array.from(
    document.querySelectorAll<HTMLButtonElement>(".maelise-icon-hover-trigger"),
  );
  const visibleTrigger = triggers.find((trigger) => {
    const bounds = trigger.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0;
  });

  if (
    prefillText !== undefined &&
    visibleTrigger?.getAttribute("aria-label")?.startsWith("Fermer")
  ) {
    return;
  }

  visibleTrigger?.click();
}
