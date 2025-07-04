"use client";

import { Button } from "@/lib/form";

type Props = {
  handleDelete: () => void;
};

export default function DeleteProductButton({ handleDelete }: Props) {
  return (
    <Button
      type="button" // form の submit を防ぐ
      onClick={() => {
        if (
          window.confirm(
            "この商品を削除しますか？関連する在庫データもすべて削除されます。この操作は元に戻せません。"
          )
        ) {
          handleDelete();
        }
      }}
      className="!bg-red-600 hover:!bg-red-700 w-full"
    >
      商品を削除する
    </Button>
  );
}
