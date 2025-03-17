import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AccountsFilterProps {
  search: string;
  setSearch: (value: string) => void;
  accountType: string;
  setAccountType: (value: string) => void;
  onSearch: () => void;
}

export function AccountsFilter({
  search,
  setSearch,
  accountType,
  setAccountType,
  onSearch,
}: AccountsFilterProps) {
  return (
    <CardContent className="pb-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={onSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Select value={accountType} onValueChange={setAccountType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại tài khoản" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả</SelectItem>
            <SelectItem value="EMPLOYEE">Staff</SelectItem>
            <SelectItem value="AGENT">Đại lý</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  );
}
