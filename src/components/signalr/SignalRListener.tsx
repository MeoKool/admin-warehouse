import { connection } from "@/lib/signalr-client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

let isConnected = false;

export default function SignalRListener() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isConnected && connection.state === "Disconnected") {
      isConnected = true;
      connection
        .start()
        .then(() => console.log("✅ Connected to SignalR"))
        .catch((err) => {
          isConnected = false;
          console.error("❌ Connect fail:", err);
        });
    }

    connection.on("ReceiveNotification", (message: string) => {
      toast(message, {
        action: {
          label: "Xem ngay",
          onClick: () => navigate("/warehouse/view-export/"),
        },
        className: "text-lg px-6 py-5 min-w-[380px]",
        style: {
          fontSize: "18px",
          borderRadius: "12px",
          minWidth: "380px",
        },
        duration: 6000,
      });
    });

    return () => {
      connection.off("ReceiveNotification");
    };
  }, []);

  return null;
}
