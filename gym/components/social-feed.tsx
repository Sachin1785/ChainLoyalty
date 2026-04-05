'use client'

import { useState } from 'react'
import { Heart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SocialFeed() {
  const [cheers, setCheers] = useState<{[key: number]: number}>({ 1: 24, 2: 18, 3: 42 })
  const [comments, setComments] = useState<{[key: number]: number}>({ 1: 5, 2: 3, 3: 8 })

  const posts = [
    {
      id: 1,
      user: 'Alex G.',
      avatar: '👤',
      time: '2h ago',
      exercise: 'New PR in Squats!',
      weight: '245 lbs',
      duration: '50m',
      reps: '5x5'
    },
    {
      id: 2,
      user: 'Jordan M.',
      avatar: '👤',
      time: '4h ago',
      exercise: 'Morning Run',
      weight: '5 miles',
      duration: '45m',
      reps: 'Cardio'
    },
    {
      id: 3,
      user: 'Casey T.',
      avatar: '👤',
      time: '6h ago',
      exercise: 'Deadlift Session',
      weight: '315 lbs',
      duration: '60m',
      reps: '3x3'
    }
  ]

  const toggleCheer = (id: number) => {
    setCheers(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }))
  }

  return (
    <section id="feed" className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-2">Friend Feed</h2>
          <p className="text-muted-foreground">Cheer on your friends and celebrate their wins</p>
        </div>

        <div className="flex gap-8">
          {/* Feed */}
          <div className="flex-1">
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-card rounded-lg p-6 border border-border shadow-sm">
                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                      {post.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-card-foreground">{post.user}</p>
                      <p className="text-sm text-muted-foreground">{post.time}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-card-foreground mb-3">{post.exercise}</h3>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/40 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Weight</p>
                      <p className="font-bold text-card-foreground">{post.weight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-bold text-card-foreground">{post.duration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sets</p>
                      <p className="font-bold text-card-foreground">{post.reps}</p>
                    </div>
                  </div>

                  {/* Interactions */}
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCheer(post.id)}
                      className="flex items-center gap-2 border-border hover:bg-muted"
                    >
                      <Heart className="w-4 h-4" />
                      Cheer ({cheers[post.id] || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 border-border hover:bg-muted"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Comment ({comments[post.id] || 0})
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard Sidebar */}
          <div className="w-80 hidden lg:block">
            <div className="bg-card rounded-lg p-6 border border-border sticky top-20">
              <h3 className="font-bold text-card-foreground mb-4">Weekly Leaderboard</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Casey T.', workouts: 7 },
                  { rank: 2, name: 'Alex G.', workouts: 6 },
                  { rank: 3, name: 'Jordan M.', workouts: 5 },
                  { rank: 4, name: 'Taylor K.', workouts: 4 },
                  { rank: 5, name: 'Morgan P.', workouts: 3 }
                ].map((user) => (
                  <div key={user.rank} className="flex items-center gap-3 pb-3 border-b border-border last:border-0">
                    <span className="text-lg font-bold text-primary w-6">{user.rank}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-card-foreground text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.workouts} workouts</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
