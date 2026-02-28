"use client";
import { useNotifications } from "@/context/NotificationProvider";
import { Bell } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

const Notifications = () => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(notification => !notification.viewed).length;
  
  const [showDropdown, setShowDropdown] = useState(false);
  
  // 1. Create a reference to the wrapper div
  const dropdownRef = useRef(null);

  // 2. Listen for clicks outside of the referenced element
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the dropdown is open and the click is outside the wrapper div, close it
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Unbind the event listener on clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
    <div className="relative" ref={dropdownRef}>
      <button
        className="hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-2 cursor-pointer relative"
        // Minor tweak: passing a callback to setState is safer for toggles
        onClick={() => setShowDropdown((prev) => !prev)} 
      >
        <Bell className="dark:text-gray-100 text-gray-900" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification._id} className="mb-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                    <a href={notification.post_url} className="flex items-center">
                      {notification.image_url && (
                        <img src={notification.image_url} alt="Notification" className="w-10 h-10 rounded-full mr-3" />
                      )}
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Notifications;