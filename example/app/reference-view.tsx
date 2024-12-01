"use client";

import { APIReference, APIReferenceCore } from "api-reference";

type ReferenceViewProps = {
  spec: APIReferenceCore;
};

export function ReferenceView({ spec }: ReferenceViewProps) {
  return (
    <APIReference.Root spec={spec}>
      <APIReference.Routes className={"w-full flex flex-col gap-4"}>
        <APIReference.Route.Title />
        <APIReference.Route.Path />
        <APIReference.Route.Description />
      </APIReference.Routes>
    </APIReference.Root>
  );
}
