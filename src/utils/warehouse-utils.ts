import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Format date for display
export const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  } catch (error) {
    console.log("Error parsing date:", error);
    return dateString;
  }
};

// Get status information
export const getStatusInfo = (
  status: string
): {
  color: string;
  bgColor: string;
  hoverColor: string;
  label: string;
  icon: string;
} => {
  const statusLower = status.toLowerCase();

  if (statusLower === "completed") {
    return {
      color: "text-green-800",
      bgColor: "bg-green-100",
      hoverColor: "hover:bg-green-200",
      label: "Hoàn thành",
      icon: "check-circle",
    };
  } else if (statusLower === "pending") {
    return {
      color: "text-yellow-800",
      bgColor: "bg-yellow-100",
      hoverColor: "hover:bg-yellow-200",
      label: "Đang chờ",
      icon: "clock",
    };
  } else if (statusLower === "processing") {
    return {
      color: "text-blue-800",
      bgColor: "bg-blue-100",
      hoverColor: "hover:bg-blue-200",
      label: "Đang xử lý",
      icon: "truck",
    };
  } else if (statusLower === "cancelled") {
    return {
      color: "text-red-800",
      bgColor: "bg-red-100",
      hoverColor: "hover:bg-red-200",
      label: "Đã hủy",
      icon: "alert-circle",
    };
  } else {
    return {
      color: "text-gray-800",
      bgColor: "bg-gray-100",
      hoverColor: "hover:bg-gray-200",
      label: status,
      icon: "info",
    };
  }
};
