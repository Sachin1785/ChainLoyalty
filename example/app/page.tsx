import { DemoClient } from "./demo-client";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col gap-6 py-16 px-6 bg-white dark:bg-black sm:px-10">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">LoyaltyChain SDK Example</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Example integration of RewardsDashboard and Leaderboard using the published npm package.
        </p>
        <DemoClient />
      </main>
    </div>
  );
}
