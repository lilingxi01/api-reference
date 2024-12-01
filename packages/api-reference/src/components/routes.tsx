import { useAPIReferenceContext } from "@/components/root";
import { RouteProvider } from "@/components/route";
import { Route } from "@/types/core";
import { HTMLAttributes, useMemo } from "react";

type RoutesProviderProps = HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode | ((route: Route) => React.ReactNode);
};

export function RoutesProvider({
  children,
  ...props
}: RoutesProviderProps): JSX.Element {
  const { spec } = useAPIReferenceContext();
  const containedView = useMemo(() => {
    return (
      <>
        {spec.routes.map((route) => (
          <RouteProvider key={route.path} route={route}>
            {typeof children === "function" ? children(route) : children}
          </RouteProvider>
        ))}
      </>
    );
  }, [spec]);
  return <div {...props}>{containedView}</div>;
}
