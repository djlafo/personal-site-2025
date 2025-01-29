import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poll" // maybe add poll data here
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
