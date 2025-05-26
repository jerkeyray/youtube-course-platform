import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

export type ContributionData = {
  date: Date;
  count: number;
};

export interface StreakData {
  streakCount: number;
  contributionData: ContributionData[];
}

export function useStreak() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["streak"],
    queryFn: async (): Promise<StreakData> => {
      const response = await fetch("/api/user/streak");

      if (!response.ok) {
        throw new Error("Failed to fetch user streak data");
      }

      const data = await response.json();

      // Transform contribution data to have proper Date objects
      const transformedData = {
        streakCount: data.streakCount,
        contributionData: data.contributionData.map((item: any) => ({
          date: new Date(item.date),
          count: item.count,
        })),
      };

      return transformedData;
    },
    // Only run query if user is authenticated
    enabled: status === "authenticated" && !!session?.user,
    // Refetch on window focus to keep data fresh
    refetchOnWindowFocus: true,
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
