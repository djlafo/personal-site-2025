import type { Metadata } from "next";
import "./globals.css";

import HeaderBar from '@/components/HeaderBar';


export const metadata: Metadata = {
  title: {
    template: "Dylan Lafont | %s",
    default: "Dylan Lafont"
  },
  description: "Personal website of Dylan Lafont",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="en">
      <body>
          <HeaderBar/>
          {children}
      </body>
    </html>
  );
}
