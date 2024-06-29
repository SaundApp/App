import { type ReactNode, useState, useEffect } from "react";

export default function Await<T>({
  children,
  promise,
}: {
  children: (result: T) => ReactNode;
  promise: Promise<T>;
}) {
  const [result, setResult] = useState<T | null>(null);

  useEffect(() => {
    promise.then(setResult);
  }, [promise]);

  if (result === null) return null;

  return children(result);
}
