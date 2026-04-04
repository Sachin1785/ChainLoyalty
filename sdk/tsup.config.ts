import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/client/index.ts",
    "src/hooks/index.ts",
    "src/components/index.ts",
    "src/types/index.ts",
    "src/components/CopyCodeButton.tsx",
    "src/components/ConnectMetaMaskSIWEButton.tsx",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
});
