import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent Collaborator",
  description: "Harness the power of multiple AI models working together.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
