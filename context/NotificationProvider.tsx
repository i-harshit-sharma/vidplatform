"use client"
import { createContext, useContext, useState } from "react"
import { notificationType } from "@/types/notification";
interface NotificationContextType {
    notifications: notificationType[];
    setNotifications: (notifications: notificationType[]) => void;
}
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NotificationContextProvider = ({children, initialValue}:{children: React.ReactNode, initialValue: notificationType[]})=>{
    const [notifications, setNotifications] = useState<notificationType[]>(initialValue);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

function useNotifications(){
    const context = useContext(NotificationContext);
    if(context == undefined){
        throw new Error("Use Notifications must be used inside the Notification Provider");
    }
    return context;
}

export {NotificationContextProvider, useNotifications}