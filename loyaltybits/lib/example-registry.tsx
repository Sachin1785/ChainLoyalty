"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

// Real client for SDK components preview
// @ts-ignore
import { ChainLoyaltyClient, Leaderboard, RewardsDashboard, ReferralWidget, SpinWidget, ConnectWalletButton, CopyCodeButton } from "loyaltychain-sdk";
// New widgets (local copies — not yet in published SDK build)
import { AchievementShowcaseWidget } from "./sdk-components/AchievementShowcaseWidget";
import { QuestBoardWidget } from "./sdk-components/QuestBoardWidget";
import { RewardStoreWidget } from "./sdk-components/RewardStoreWidget";
import { TierProgressWidget } from "./sdk-components/TierProgressWidget";
// Mock previews for components that require a live backend
import { LeaderboardPreview } from "./sdk-components/LeaderboardPreview";
import { RewardsDashboardPreview } from "./sdk-components/RewardsDashboardPreview";
import { SpinWidgetPreview } from "./sdk-components/SpinWidgetPreview";
// @ts-ignore
import { ConnectMetaMaskSIWEButton } from "loyaltychain-sdk/components/ConnectMetaMaskSIWEButton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const realClient = new ChainLoyaltyClient({ baseUrl: "http://localhost:8000", apiKey: "demo" });
const queryClient = new QueryClient();

export const ExampleRegistry: Record<string, React.FC<any>> = {
  button: () => (
    <div className="flex flex-wrap gap-4 items-center justify-center">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
  badge: () => (
    <div className="flex gap-4">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
  alert: () => (
    <Alert>
      <div className="text-sm">This is a default alert for important information.</div>
    </Alert>
  ),
  input: () => (
    <div className="w-full max-w-sm space-y-2">
      <Input type="email" placeholder="Email" />
    </div>
  ),
  card: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-balance">
          Select the framework you want to use and connect it to your repository.
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
  tabs: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="p-4 border rounded mt-2">Make changes to your account here.</div>
      </TabsContent>
      <TabsContent value="password">
        <div className="p-4 border rounded mt-2">Change your password here.</div>
      </TabsContent>
    </Tabs>
  ),
  leaderboard: ({ theme }) => (
    <LeaderboardPreview
      title="Top Users Preview"
      theme={theme || {}}
      className=""
      style={{}}
    />
  ),
  'rewards-dashboard': ({ theme }) => (
    <RewardsDashboardPreview
      walletAddress="0xPreview1234...abcd"
      title="Your Rewards"
      theme={theme || {}}
      className=""
      style={{}}
    />
  ),
  'referral-widget': ({ theme }) => (
    <QueryClientProvider client={queryClient}>
      <ReferralWidget 
        client={realClient} 
        walletAddress="0xpreview...abcd" 
        referralRewardText="Invite a friend & get 200 points!" 
        theme={theme || {}}
        className=""
        style={{}}
        onConnect={() => {}}
      />
    </QueryClientProvider>
  ),
  'spin-widget': ({ theme }) => (
    <SpinWidgetPreview
      title="Daily Free Spin"
      theme={theme || {}}
      className=""
      style={{}}
    />
  ),
  'connect-wallet-button': ({ theme }) => (
    <QueryClientProvider client={queryClient}>
      <div className="flex justify-center items-center py-10 w-full">
        <ConnectWalletButton 
          onConnect={() => alert("Wallet Connected!")}
          theme={theme || {}}
          className=""
          style={{}}
        />
      </div>
    </QueryClientProvider>
  ),
  'copy-code-button': () => (
    <div className="flex justify-center items-center py-10 w-full">
      <CopyCodeButton code="ExampleCode123" />
    </div>
  ),
  'connect-metamask-siwe-button': () => (
    <QueryClientProvider client={queryClient}>
      <div className="flex justify-center items-center py-10 w-full">
        <ConnectMetaMaskSIWEButton 
          onConnect={(addr, jwt) => console.log('Connected', addr)}
          siweApiUrl="http://localhost:8000"
        />
      </div>
    </QueryClientProvider>
  ),
  'achievement-showcase-widget': ({ theme }) => (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-2xl w-full mx-auto py-4">
        <AchievementShowcaseWidget 
          client={realClient} 
          walletAddress="0xpreview...abcd" 
          availableBadges={[
            { id: "beta_tester", name: "Beta Tester", description: "Participated in the beta", imageUrl: "https://via.placeholder.com/64" },
            { id: "first_tx", name: "First Tx", description: "Made your first transaction", imageUrl: "https://via.placeholder.com/64" }
          ]}
          title="My Badges" 
          theme={theme || {}}
          className=""
          style={{}}
        />
      </div>
    </QueryClientProvider>
  ),
  'quest-board-widget': ({ theme }) => (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-xl w-full mx-auto py-4">
        <QuestBoardWidget 
          client={realClient} 
          walletAddress="0xpreview...abcd" 
          quests={[
            { id: "follow_twitter", title: "Follow Twitter", description: "Follow @ourproject", rewardPoints: 50, icon: "🐦" },
            { id: "join_discord", title: "Join Discord", description: "Join our server", rewardPoints: 100, icon: "💬" }
          ]}
          title="Active Quests" 
          theme={theme || {}}
          className=""
          style={{}}
        />
      </div>
    </QueryClientProvider>
  ),
  'reward-store-widget': ({ theme }) => (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-3xl w-full mx-auto py-4">
        <RewardStoreWidget 
          client={realClient} 
          walletAddress="0xpreview...abcd" 
          items={[
            { id: "item_1", name: "Discord Role", description: "Exclusive VIP Role", cost: 500, imageUrl: "https://via.placeholder.com/150" },
            { id: "item_2", name: "Coupon", description: "10% off coupon code", cost: 1000, imageUrl: "https://via.placeholder.com/150" }
          ]}
          title="Rewards Store"
          theme={theme || {}}
          className=""
          style={{}}
        />
      </div>
    </QueryClientProvider>
  ),
  'tier-progress-widget': ({ theme }) => (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-md w-full mx-auto py-4">
        <TierProgressWidget 
          client={realClient} 
          walletAddress="0xpreview...abcd" 
          tiers={[
            { name: "Bronze", minPoints: 0, color: "#CD7F32" },
            { name: "Silver", minPoints: 1000, color: "#C0C0C0" },
            { name: "Gold", minPoints: 5000, color: "#FFD700" }
          ]}
          title="VIP Status" 
          theme={theme || {}}
          className=""
          style={{}}
        />
      </div>
    </QueryClientProvider>
  ),
};
