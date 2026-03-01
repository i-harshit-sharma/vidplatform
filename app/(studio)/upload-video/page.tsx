"use client";
import { useChannels } from "@/context/ChannelContext";
import React from "react";
const page = () => {
	const {selectedChannel} = useChannels();
	return (
		<pre>{JSON.stringify(selectedChannel, null, 2)} </pre>
	);
};

export default page;
