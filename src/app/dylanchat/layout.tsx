import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talk to Dylan"
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
