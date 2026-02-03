import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProductToVideo.ai",
  description:
    "Turn any product URL into a stunning video ad with AI. Support for 10+ e-commerce platforms and 8 languages.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
