import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interval Timer"
};

export default function RootLayout({
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
