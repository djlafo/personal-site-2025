import type { Metadata } from "next";
import "./globals.css";

import HeaderBar from '@/components/HeaderBar';

import { UserProvider } from "@/components/Session";
import { getUserInfo } from "@/actions/auth";

export const metadata: Metadata = {
  title: {
    template: "Dylan Lafont | %s",
    default: "Dylan Lafont"
  },
  description: "Personal website of Dylan Lafont",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getUserInfo()

  return (
    <html lang="en">
      <body>
        <UserProvider user={user}>
          <HeaderBar/>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
