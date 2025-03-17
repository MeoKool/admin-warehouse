import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { AccountsHeader } from "./components/accounts-header";
import { AccountsTable } from "./components/accounts-table";
import { AccountsPagination } from "./components/accounts-pagination";
import accountService, { Account } from "./services/account-services";
import { AccountsFilter } from "./components/account-filters";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [accountType, setAccountType] = useState<string>("");

  // Fetch all accounts at once
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountService.getAccounts();
      setAccounts(response.items);
      console.log("response", response);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Không thể tải danh sách tài khoản");
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Filter accounts based on search and accountType
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // Filter by search term (username, email, fullName, phone)
      const searchMatch =
        search === "" ||
        account.username.toLowerCase().includes(search.toLowerCase()) ||
        account.email.toLowerCase().includes(search.toLowerCase()) ||
        (account.username &&
          account.username.toLowerCase().includes(search.toLowerCase())) ||
        account.phone.toLowerCase().includes(search.toLowerCase());

      // Filter by account type
      const typeMatch =
        accountType === "ALL" ||
        accountType === "" ||
        account.userType === accountType;

      return searchMatch && typeMatch;
    });
  }, [accounts, search, accountType]);

  // Calculate pagination
  const totalItems = filteredAccounts.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedAccounts = filteredAccounts.slice(
    (page - 1) * limit,
    page * limit
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, accountType]);

  const handleDelete = async (userId: string | number) => {
    try {
      await accountService.deleteAccount(String(userId));
      toast.success("Xóa tài khoản thành công");
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Không thể xóa tài khoản");
    }
  };

  const handleToggleStatus = async (
    userId: string | number,
    currentStatus: boolean
  ) => {
    try {
      await accountService.toggleAccountStatus(String(userId), !currentStatus);
      toast.success(
        `Tài khoản đã được ${!currentStatus ? "kích hoạt" : "vô hiệu hóa"}`
      );

      // Update the account status locally to avoid refetching all accounts
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.userId === userId
            ? { ...account, status: !currentStatus }
            : account
        )
      );
    } catch (error) {
      console.error("Error toggling account status:", error);
      toast.error("Không thể thay đổi trạng thái tài khoản");
    }
  };

  return (
    <div className="space-y-4">
      <AccountsHeader />

      <AccountsFilter
        search={search}
        setSearch={setSearch}
        accountType={accountType}
        setAccountType={setAccountType}
      />

      <AccountsTable
        accounts={paginatedAccounts}
        loading={loading}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />

      {totalItems > 0 && (
        <AccountsPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
