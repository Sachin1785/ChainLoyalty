'use client'

import { Button } from '@/components/ui/button'

export default function RewardsDashboard() {
  const rewards = [
    {
      id: 1,
      title: 'The Streak Reward',
      description: '5 days of posting',
      discount: '10% off',
      current: 3,
      target: 5,
      status: 'in-progress'
    },
    {
      id: 2,
      title: 'The Community Reward',
      description: 'Group Power Voucher',
      discount: '15% off group buy',
      current: 2,
      target: 3,
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'The PR Reward',
      description: 'Personal Record logged',
      discount: 'Early access to new gear',
      current: 1,
      target: 1,
      status: 'unlocked',
      code: 'STRIDE-PR-2024'
    }
  ]

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100
  }

  return (
    <section id="rewards" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">Rewards Dashboard</h2>
          <p className="text-muted-foreground">Track your progress and unlock exclusive discounts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rewards.map((reward) => (
            <div key={reward.id} className="bg-card rounded-lg p-8 border border-border shadow-sm">
              {/* Status Badge */}
              <div className="mb-4">
                {reward.status === 'unlocked' ? (
                  <span className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Unlocked
                  </span>
                ) : (
                  <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {reward.current}/{reward.target}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-card-foreground mb-2">{reward.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{reward.description}</p>

              {/* Reward Badge */}
              <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-primary font-bold text-lg">{reward.discount}</p>
              </div>

              {/* Progress Ring */}
              {reward.status === 'in-progress' && (
                <div className="mb-6">
                  <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${calculateProgress(reward.current, reward.target)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {reward.current} of {reward.target} complete
                  </p>
                </div>
              )}

              {/* Action Button */}
              {reward.status === 'unlocked' && reward.code && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Discount Code</p>
                    <p className="font-bold text-card-foreground text-lg">{reward.code}</p>
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Copy Code
                  </Button>
                </div>
              )}

              {reward.status === 'in-progress' && (
                <Button variant="outline" className="w-full border-border hover:bg-muted">
                  Keep Pushing
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Milestone Badges Section */}
        <div className="mt-16 pt-12 border-t border-border">
          <h3 className="text-2xl font-bold text-foreground mb-8">Milestone Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['🥉 Bronze', '🥈 Silver', '🥇 Gold', '💎 Platinum'].map((badge, i) => (
              <div key={i} className="bg-card rounded-lg p-6 border border-border text-center">
                <div className="text-4xl mb-2">{badge.split(' ')[0]}</div>
                <p className="font-semibold text-card-foreground">{badge.split(' ')[1]}</p>
                <p className="text-xs text-muted-foreground mt-1">30+ workouts</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
