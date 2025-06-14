import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CVAnalysis, OpportunityWithMatch, UserProfile } from "@/types";

export function useAnalyzeCV() {
  return useMutation({
    mutationFn: async ({ cvText, userProfile }: { cvText: string; userProfile?: UserProfile }) => {
      const response = await apiRequest("POST", "/api/analyze-cv", { cvText, userProfile });
      return response.json();
    },
  });
}

export function useGetMatches() {
  return useMutation({
    mutationFn: async ({ userId, userProfile }: { userId?: number; userProfile?: UserProfile }) => {
      const response = await apiRequest("POST", "/api/get-matches", { userId, userProfile });
      return response.json();
    },
  });
}

export function useChat() {
  return useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: any }) => {
      const response = await apiRequest("POST", "/api/chat", { message, context });
      return response.json();
    },
  });
}

export function useOpportunities() {
  return useQuery({
    queryKey: ["/api/opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities");
      if (!response.ok) throw new Error("Failed to fetch opportunities");
      return response.json();
    },
  });
}
