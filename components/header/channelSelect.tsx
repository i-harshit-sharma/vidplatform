"use client";
import { useChannels } from "@/context/ChannelContext";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ChannelSelect = () => {
	const { channels, selectedChannel, setSelectedChannel } = useChannels();
	const [openDropdown, setOpenDropdown] = useState(false);

	return (
		<div
			className="relative"
			onClick={() => setOpenDropdown(!openDropdown)}
		>
			<div className="flex items-center space-x-2 cursor-pointer">
				{selectedChannel?.profile_picture_url && (
					<Image
						src={selectedChannel.profile_picture_url}
						alt="avatar"
						width={30}
						height={30}
						unoptimized
					/>
				)}
				{selectedChannel?.name}
			</div>
			{openDropdown && (
				<div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded shadow-lg z-10">
					{channels?.map((channel) => (
						<div
							key={channel._id}
							className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
							onClick={() => {
								setSelectedChannel(channel);
								setOpenDropdown(false);
							}}
						>
							{channel.profile_picture_url && (
							<Image
								src={channel.profile_picture_url}
								alt="avatar"
								width={30}
								height={30}
								unoptimized
							/>
							)}
							{channel.name}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

// const ChannelSelectWrapper = () => {
// 	const { channels } = useChannels();
// 	const [loading, setLoading] = useState(true);

export default ChannelSelect;
