"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import FlightProvider from "@/components/flights/FlightProvider";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <SessionProvider>
      <FlightProvider>
        {children}
      </FlightProvider>
    </SessionProvider>
  );
}