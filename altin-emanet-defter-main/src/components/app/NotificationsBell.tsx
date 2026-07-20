import { Bell } from "lucide-react";

export function NotificationsBell({ userId }: { userId: string }) {
  return (
    <div className="relative">
      <button
        className="relative rounded-lg border border-border bg-surface p-2 hover:bg-surface-elevated"
        aria-label="Bildirimler"
      >
        <Bell className="h-4 w-4" />
      </button>
    </div>
  );
}
