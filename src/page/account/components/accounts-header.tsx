import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AccountsHeader() {
  return (
    <CardHeader className="pb-4">
      <CardTitle className="text-xl font-bold">Quản lí Account</CardTitle>
      <CardDescription>Xác nhận Account đó là Staff hay Đại lý</CardDescription>
    </CardHeader>
  );
}
