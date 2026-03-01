"use client";
import globalLogout from "@/actions/globalLogout";
import logoutUser from "@/actions/logout";
import { useAuth } from "@/context/AuthProvider";
import React, { useState, useEffect, useRef, CSSProperties } from "react";

const Avatar = ({ size = 40 }) => {
	const { user } = useAuth();
	if (!user) return null;
	const name = user?.username || "User";
	// 1. Extract Initials (e.g., "John Doe" -> "JD")
	const getInitials = (name: string) => {
		const parts = name.trim().split(" ");
		if (parts.length > 1) {
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		}
		return parts[0].substring(0, 2).toUpperCase();
	};

	// 2. Deterministic Color Picker
	// Using a set of Material Design-inspired colors
	const colors = [
		"#1abc9c",
		"#2ecc71",
		"#3498db",
		"#9b59b6",
		"#34495e",
		"#16a085",
		"#27ae60",
		"#2980b9",
		"#8e44ad",
		"#2c3e50",
		"#f1c40f",
		"#e67e22",
		"#e74c3c",
		"#95a5a6",
		"#f39c12",
		"#d35400",
		"#c0392b",
		"#7f8c8d",
	];

	const getColor = (str: string) => {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = str.charCodeAt(i) + ((hash << 5) - hash);
		}
		const index = Math.abs(hash) % colors.length;
		return colors[index];
	};

	const backgroundColor = getColor(name);
	const initials = getInitials(name);

	// 3. Styles
	const style: CSSProperties = {
		backgroundColor,
		width: `${size}px`,
		height: `${size}px`,
		borderRadius: "50%",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#ffffff",
		fontWeight: "500",
		fontFamily: "Roboto, Arial, sans-serif",
		fontSize: `${size * 0.4}px`,
		userSelect: "none",
		textShadow: "0px 1px 2px rgba(0,0,0,0.1)",
	};
	const [showDropdown, setShowDropdown] = useState(false);

	// 1. Create a reference to the wrapper div
	const dropdownRef = useRef<HTMLDivElement>(null);

	// 2. Listen for clicks outside of the referenced element
	useEffect(() => {
		const handleClickOutside = (event: { target: any; }) => {
			// If the dropdown is open and the click is outside the wrapper div, close it
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target)
			) {
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
					className="hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-0.5 cursor-pointer relative"
					// Minor tweak: passing a callback to setState is safer for toggles
					onClick={() => setShowDropdown((prev) => !prev)}
				>
					<div title={name} style={style}>
						{initials}
					</div>
				</button>

				{showDropdown && (
					<div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50">
						<div className="p-4">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
								{user.username}
								{
									<span className="text-sm text-gray-500 dark:text-gray-400 block">
										{user.email}
									</span>
								}
							</h3>
							<button
								className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
								onClick={async () => {
									await logoutUser();
									setShowDropdown(false);
								}}
							>
								Logout
							</button>
							<button
								className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
								onClick={async () => {
									await globalLogout();
									// Implement profile navigation logic here
								}}
							>
								Logout from all devices
							</button>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default Avatar;
