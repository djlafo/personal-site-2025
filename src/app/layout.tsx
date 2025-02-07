import type { Metadata } from "next";
import "./globals.css";

import { ToastContainer } from 'react-toastify';

import HeaderBar from '@/components/HeaderBar';
import { UserProvider } from "@/components/Session";
import { LoadingScreen } from "@/components/LoadingScreen";

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
        <ToastContainer/>
        <UserProvider>
          <LoadingScreen>
            <HeaderBar/>
            <div className='fadechildren'>
              {children}
            </div>
          </LoadingScreen>
        </UserProvider>
      </body>
    </html>
  );
}
