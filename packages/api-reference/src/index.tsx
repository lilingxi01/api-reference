"use client";

import { RootProvider } from "@/components/root";
import { RoutesProvider } from "@/components/routes";
import { RouteComponents } from "@/components/route";

export const APIReference = {
  Root: RootProvider,
  Routes: RoutesProvider,
  Route: RouteComponents,
};

export type { APIReferenceCore } from "./types/core";
export { ContentType, RouteMethod } from "./types/core";
