import { getUser } from "@/lib/sessions";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Account"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const user = await getUser();
  if(!user) {
    redirect('/login?redirect=/account');
  }

  return (
    <>
        <Suspense>
            {children}
        </Suspense>
    </>
  );
}
