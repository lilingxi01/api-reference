"use client";

import { APIReference, APIReferenceCore } from "api-reference";

type ReferenceViewProps = {
  spec: APIReferenceCore;
};

export function ReferenceView({ spec }: ReferenceViewProps) {
  return (
    <APIReference.Root spec={spec}>
      <APIReference.Routes className={"w-full flex flex-col gap-4"}>
        <APIReference.Route.Path />
      </APIReference.Routes>
    </APIReference.Root>
  );
}
