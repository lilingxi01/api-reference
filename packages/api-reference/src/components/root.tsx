import { APIReferenceCore } from "@/types/core";
import React, { createContext, useContext } from "react";

type APIReferenceContextType = {
  spec: APIReferenceCore;
};

const APIReferenceContext = createContext<APIReferenceContextType | null>(null);

export function useAPIReferenceContext(): APIReferenceContextType {
  const context = useContext(APIReferenceContext);
  if (!context) {
    throw new Error("useAPIReferenceContext must be used within a Provider");
  }
  return context;
}

type RootProviderProps = {
  spec: APIReferenceCore;
  children: React.ReactNode;
};

export function RootProvider({
  spec,
  children,
}: RootProviderProps): JSX.Element {
  return (
    <APIReferenceContext.Provider value={{ spec }}>
      {children}
    </APIReferenceContext.Provider>
  );
}
