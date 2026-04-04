"use client";

import React from "react";
import { Card, StatCard, Badge as BadgeUI } from "@/components/shared/ui";
import { useUserData, useWallet } from "@/lib/hooks";
import { formatNumber, shortenAddress } from "@/lib/utils/auth";
import { Wallet, TrendingUp, Award, Zap } from "lucide-react";

export function UserStatsOverview() {
  const { session } = useWallet();
  const { stats, loading } = useUserData();

  if (!session) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Connect your wallet to see your stats
        </p>
      </Card>
    );
  }

  if (loading || !stats) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 flex items-center gap-2">
              <Wallet size={16} />
              Connected Wallet
            </p>
            <h2 className="text-2xl font-bold mt-2">
              {shortenAddress(session.address)}
            </h2>
          </div>
          <div className="text-4xl opacity-20">
            <Wallet size={64} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Points Balance"
          value={formatNumber(stats.pointsBalance)}
          icon={<Zap size={32} className="text-yellow-500" />}
        />
        <StatCard
          label="Lifetime Earned"
          value={formatNumber(stats.lifetimeEarned)}
          icon={<TrendingUp size={32} className="text-green-500" />}
          trend={12}
        />
        <StatCard
          label="Lifetime Spent"
          value={formatNumber(stats.lifetimeSpent)}
          icon={<Zap size={32} className="text-orange-500" />}
        />
        <StatCard
          label="Badges Earned"
          value={stats.badgesCount}
          icon={<Award size={32} className="text-purple-500" />}
        />
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Activity Summary
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Spins
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalSpins}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Avg Points/Spin
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalSpins > 0
                ? formatNumber(stats.lifetimeSpent / stats.totalSpins)
                : "0"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
