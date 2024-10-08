import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";

import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/components/convex-client-provider";

import { Modals } from "@/components/modals";
import { JotaiProvider } from "@/components/jotai-provider";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Slackyy",
    description:
        "A full stack Slack clone built using NextJs, featuring real-time messaging, user authentication, and dynamic channels. The app replicates key functionalities of Slack, including message threading, file sharing, and 1:1 conversations, providing a seamless communication experience.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ConvexAuthNextjsServerProvider>
            <html lang="en">
                <body className={inter.className}>
                    <ConvexClientProvider>
                        <JotaiProvider>
                            <Toaster />
                            <Modals />
                            {children}
                        </JotaiProvider>
                    </ConvexClientProvider>
                </body>
            </html>
        </ConvexAuthNextjsServerProvider>
    );
}
