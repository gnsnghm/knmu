import { Label, Input, Button } from "@/lib/form";

export default function ProductNew() {
  return (
    <form
      action="/api/items"
      method="post"
      className="p-4 max-w-md mx-auto space-y-4"
    >
      <h1 className="text-xl font-semibold">商品手動登録</h1>
      <div>
        <Label>JAN</Label>
        <Input name="barcode" required />
      </div>
      <div>
        <Label>名称</Label>
        <Input name="name" required />
      </div>
      <div>
        <Label>ブランド</Label>
        <Input name="brand" />
      </div>
      <div>
        <Label>画像URL</Label>
        <Input name="image_url" />
      </div>
      <Button>保存</Button>
    </form>
  );
}
