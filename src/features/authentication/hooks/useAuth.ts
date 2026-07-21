import { useAuthContext } from "@/features/authentication/context/AuthContext";

export function useAuth() {
  return useAuthContext();
}
