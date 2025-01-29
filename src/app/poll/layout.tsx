import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poll"
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
