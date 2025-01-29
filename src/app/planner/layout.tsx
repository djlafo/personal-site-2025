import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Planner"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      {children}
    </>
  );
}