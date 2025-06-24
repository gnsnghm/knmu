import { ReactNode } from "react";

export function Label({ children }: { children: ReactNode }) {
  return <label className="font-medium text-sm">{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="border rounded px-3 py-2 w-full text-sm focus:outline-blue-500"
    />
  );
}

export function Button({ children }: { children: ReactNode }) {
  return (
    <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
      {children}
    </button>
  );
}
