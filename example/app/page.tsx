import { APIReference, transformOpenAPISpec } from "api-reference";
import spec from "./openapi.json";

export default function Page() {
  console.log(JSON.stringify(transformOpenAPISpec(spec as any), null, 2));
  return (
    <div>
      <APIReference.Provider />
    </div>
  );
}
