"use client";

import { ComponentProps } from "react";

/**
 * フォームで利用する Label コンポーネント
 * 標準の label 要素の props をすべて受け付けます。
 */
export function Label(props: ComponentProps<"label">) {
  return (
    <label
      {...props}
      className="block mb-1 text-sm font-medium text-gray-700"
    />
  );
}

/**
 * フォームで利用する Input コンポーネント
 * 標準の input 要素の props をすべて受け付けます。
 */
export function Input(props: ComponentProps<"input">) {
  return (
    <input
      {...props}
      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
    />
  );
}

/**
 * フォームで利用する Button コンポーネント
 * 標準の button 要素の props をすべて受け付けます。
 */
export function Button(props: ComponentProps<"button">) {
  return (
    <button
      {...props}
      type="submit"
      className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    />
  );
}
