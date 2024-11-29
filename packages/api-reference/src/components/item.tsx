"use client";

import React, { createContext, useContext } from "react";
import { Route } from "@/types/core";

type ItemContextType = {
  route: Route;
};

const ItemContext = createContext<ItemContextType | null>(null);

export function useItemContext(): ItemContextType {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error("useItemContext must be used within a Item");
  }
  return context;
}

type ItemProps = {
  route: Route;
  children: React.ReactNode;
};

export function Item({ route, children }: ItemProps): JSX.Element {
  return (
    <ItemContext.Provider value={{ route }}>{children}</ItemContext.Provider>
  );
}

export function ItemTitle(): JSX.Element {
  const { route } = useItemContext();
  return <h3>{route.title}</h3>;
}
