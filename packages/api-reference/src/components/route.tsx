import React, { createContext, useContext } from "react";
import { Route } from "@/types/core";

type RouteContextType = {
  route: Route;
};

const RouteContext = createContext<RouteContextType | null>(null);

export function useRouteContext(): RouteContextType {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error("useRouteContext must be used within a Item");
  }
  return context;
}

type RouteProviderProps = {
  route: Route;
  children: React.ReactNode;
};

export function RouteProvider({
  route,
  children,
}: RouteProviderProps): JSX.Element {
  return (
    <RouteContext.Provider value={{ route }}>{children}</RouteContext.Provider>
  );
}

export const RouteComponents = {
  Root: RouteProvider,
  Title: () => {
    const { route } = useRouteContext();
    return <span>{route.title}</span>;
  },
  Path: () => {
    const { route } = useRouteContext();
    return <span>{route.path}</span>;
  },
  Description: () => {
    const { route } = useRouteContext();
    return <span>{route.description}</span>;
  },
};
