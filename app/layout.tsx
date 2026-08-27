import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f2eee5",
};

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
  const base = `${protocol}://${host}`;
  return {
    title: "YONG QI — Portfolio 2026",
    description: "YONG QI 2026作品集：电商视觉、产品渲染与 AIGC 结合。",
    icons: { icon: "/favicon.png", shortcut: "/favicon.png" },
    openGraph: { title: "YONG QI — Portfolio 2026", description: "E-commerce visuals, product visualization and AI-assisted creation.", images: [`${base}/og.png`] },
    twitter: { card: "summary_large_image", title: "YONG QI — Portfolio 2026", description: "E-commerce visuals, product visualization and AI-assisted creation.", images: [`${base}/og.png`] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
