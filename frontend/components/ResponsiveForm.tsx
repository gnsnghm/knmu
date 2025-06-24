import { ReactNode } from "react";

export default function ResponsiveForm({ children }: { children: ReactNode }) {
  return (
    <form className="mx-auto max-w-md p-4 flex flex-col gap-4">{children}</form>
  );
}
