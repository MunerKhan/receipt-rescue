import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Receipt Rescue | Never Miss a Return Deadline",
  description:
    "Track return deadlines, warranty expirations, order numbers, and purchase notes in one simple dashboard.",

  verification: {
    google: "myH-jQ8oNHPhTK51mgPKMtaA5ejHVRzj8jZ7fEY-SrQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}