"use client";
//TODO move the menu into its own component and make this server component
import { Menu } from "lucide-react";
import Logo from "../header/logo";
import Search from "../header/search";
import Create from "../header/create";
import Notifications from "../header/notifications";
import UserMenu from "../header/userMenu";
import ChannelSelect from "../header/channelSelect";

const Header = ({showChannel = false}: {showChannel?: boolean}) => {
	return (
		<div className="flex dark:bg-gray-900 bg-gray-50 justify-between items-center px-4 py-2">
			<div className="flex justify-between gap-2 items-center">
				<button
					className="hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full p-2 cursor-pointer"
					onClick={() => {}}
				>
					<Menu className="dark:text-gray-100 text-gray-900" />
				</button>
				<Logo />
			</div>
			<div className="flex-1">
				<Search />
			</div>
			<div className="flex justify-between items-center gap-6">
				{showChannel && <ChannelSelect/>}
				<Create />
				<Notifications />
				<UserMenu />
			</div>
		</div>
	);
};

export default Header;
