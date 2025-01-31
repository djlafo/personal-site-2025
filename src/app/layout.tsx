import type { Metadata } from "next";
import "./globals.css";

import HeaderBar from '@/components/HeaderBar';

import { UserProvider } from "@/components/Session";

export const metadata: Metadata = {
  title: "Dylan Lafont | Home",
  description: "Personal website of Dylan Lafont",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <HeaderBar/>
          <div className='fadechildren'>
            {children}
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
