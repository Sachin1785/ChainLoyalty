"use client";

import React from "react";
import { Card, Button, Badge as BadgeUI } from "@/components/shared/ui";
import { useUserData } from "@/lib/hooks";
import { Badge } from "@/lib/types";
import { Award, Lock, ExternalLink } from "lucide-react";

export function BadgeShowcase() {
  const { badges, loading } = useUserData();

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Achievement Badges
      </h2>

      {badges && badges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <Card
              key={badge.id}
              className="p-4 hover:shadow-xl transition-shadow cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="relative h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Award
                    size={48}
                    className="text-yellow-500 group-hover:scale-110 transition-transform"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <BadgeUI
                    variant={badge.transferable ? "primary" : "warning"}
                  >
                    {badge.transferable ? "Transferable" : "Soulbound"}
                  </BadgeUI>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs"
                    title="View metadata"
                  >
                    <ExternalLink size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-xs"
                    title="Claim badge"
                  >
                    <Lock size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Award className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            No badges earned yet. Complete achievements to earn badges!
          </p>
        </Card>
      )}
    </div>
  );
}
