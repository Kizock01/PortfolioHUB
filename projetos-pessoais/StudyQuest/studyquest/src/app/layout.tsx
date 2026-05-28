import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AcademicSetupModal } from "@/components/AcademicSetupModal";
import { DevMountLog } from "@/components/DevMountLog";
import { AuthProvider } from "@/store/AuthContext";
import { GameProvider } from "@/store/GameContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyQuest",
  description: "Transforme seus estudos em uma jornada RPG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#070813] text-white">
        <AuthProvider>
          <GameProvider>
            <DevMountLog label="layout mounted" />
            {children}
            <AcademicSetupModal />
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
