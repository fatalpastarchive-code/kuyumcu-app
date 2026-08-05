import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface NotificationSettings {
  enabled: boolean;
  singleNotification: boolean; // true = single, false = bulk
  notificationTime: string; // "09:00", "18:00", etc.
  advanceNotice: number; // days before due date
}

interface NotificationContextType {
  settings: NotificationSettings;
  requestPermission: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  permission: NotificationPermission;
  sendNotification: (title: string, body: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  singleNotification: true,
  notificationTime: "09:00",
  advanceNotice: 1,
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load saved settings from localStorage after mount (avoids SSR hydration mismatch)
    try {
      const saved = localStorage.getItem("notificationSettings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch {}

    // Check current permission state (don't auto-request)
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    }

    return false;
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem("notificationSettings", JSON.stringify(updated));
  };

  const sendNotification = async (title: string, body: string) => {
    if (!settings.enabled || permission !== "granted") {
      return;
    }

    let sent = false;
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [200, 100, 200, 100, 200],
            requireInteraction: true,
          } as any);
          sent = true;
        }
      } catch (err) {
        console.warn("ServiceWorker notification failed, falling back to window Notification:", err);
      }
    }

    if (!sent && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          vibrate: [200, 100, 200],
          requireInteraction: true,
        } as any);
      } catch (err) {
        console.error("Window Notification failed:", err);
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        settings,
        requestPermission,
        updateSettings,
        permission,
        sendNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
