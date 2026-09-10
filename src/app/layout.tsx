import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cloud Functions — Webhook Handler",
  description: "Next.js webhook handler deployed on Vercel",
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
