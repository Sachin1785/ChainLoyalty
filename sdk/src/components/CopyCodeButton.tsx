import React from "react";

interface CopyCodeButtonProps {
  code: string;
  label?: string;
}

export const CopyCodeButton: React.FC<CopyCodeButtonProps> = ({ code, label = "Copy code" }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? "#22c55e" : "#f1f5f9",
        color: copied ? "#fff" : "#0f172a",
        border: "1px solid #e2e8f0",
        borderRadius: 6,
        padding: "6px 12px",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.2s",
        outline: "none",
        boxShadow: copied ? "0 2px 8px 0 rgba(34,197,94,0.10)" : undefined,
      }}
      aria-label={label}
      title={label}
    >
      {copied ? "Copied!" : label}
    </button>
  );
};
