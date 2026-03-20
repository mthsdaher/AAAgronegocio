import React, { createContext, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  getGetCurrentUserQueryKey,
  UserProfile,
  LoginRequest,
  RegisterRequest,
} from "@workspace/api-client-react";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      queryKey: getGetCurrentUserQueryKey(),
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    }
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(["/api/auth/me"], null);
        window.location.href = "/entrar";
      }
    }
  });

  const value = {
    user: user ?? null,
    isLoading,
    login: async (data: LoginRequest) => {
      await loginMutation.mutateAsync({ data });
    },
    register: async (data: RegisterRequest) => {
      await registerMutation.mutateAsync({ data });
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
