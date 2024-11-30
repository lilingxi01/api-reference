import React from "react";

function Provider(): JSX.Element {
  return <div>API Reference</div>;
}

// Placeholder for project name.
export const APIReference = {
  Provider,
};

export { transformOpenAPISpec } from "./utils/openapi";

export type { APIReferenceCore } from "./types/core";
export { ContentType, RouteMethod } from "./types/core";
