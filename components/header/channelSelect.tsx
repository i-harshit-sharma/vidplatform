"use client";
import saveChannelSelection from "@/actions/saveChannelSelection";
import { useChannels } from "@/context/ChannelContext";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ChannelSelect = () => {
	const { channels, selectedChannel, setSelectedChannel } = useChannels();
	const currentChannel = selectedChannel !== null ? channels?.find(c => c._id === selectedChannel) : null;
	const [openDropdown, setOpenDropdown] = useState(false);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest(".channel-dropdown") && !target.closest(".channel-select-button")) {
				setOpenDropdown(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);


	return (
		<div
			className="relative channel-select-button"
			onClick={() => setOpenDropdown(!openDropdown)}
		>
			<div className="flex items-center space-x-2 cursor-pointer p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
				{currentChannel?.profile_picture_url && (
					<Image
						title={currentChannel.name}
						src={currentChannel.profile_picture_url}
						alt="avatar"
						width={25}
						height={25}
						unoptimized
						className="w-6 h-6 rounded-full object-cover"
					/>
				)}
				{/* {selectedChannel?.name} */}
			</div>
			{openDropdown && (
				<div className="absolute top-full right-0 mt-2  bg-white border border-gray-100 rounded shadow-lg z-10 channel-dropdown">
					{channels?.map((channel, index) => (
						<div
							key={channel._id}
							className="flex items-center gap-2 space-x-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
							onClick={() => {
								saveChannelSelection(channel._id);
								setSelectedChannel(channel._id);
								setOpenDropdown(false);
							}}
						>
							{channel.profile_picture_url && (
								<Image
									src={channel.profile_picture_url}
									alt="avatar"
									width={25}
									height={25}
									unoptimized
									className="w-6 h-6 rounded-full object-cover"
								/>
							)}
							<p className="truncate" title={channel.name}>{channel.name}</p>
							{/* {channel.name} */}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ChannelSelect;
