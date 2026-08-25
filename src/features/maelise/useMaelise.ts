import { useContext } from "react";
import { MaeliseContext } from "./context";

export function useMaelise() {
  const context = useContext(MaeliseContext);
  if (!context) throw new Error("useMaelise must be used inside MaeliseProvider");
  return context;
}
