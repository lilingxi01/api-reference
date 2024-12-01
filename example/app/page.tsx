import { transformOpenAPISpec } from "api-reference/utils";
import spec from "./openapi.json";
import { ReferenceView } from "@/app/reference-view";

export default function Page() {
  const transformedSpec = transformOpenAPISpec(spec as any);
  console.log(JSON.stringify(transformedSpec, null, 2));
  return (
    <div>
      <ReferenceView spec={transformedSpec} />
    </div>
  );
}
