import type { Metadata } from "next";
import { headers } from "next/headers";
import getUserInfo from "@/data/getUserInfo";
import getChannels from "@/data/getChannels";
import { ChannelContextProvider } from "@/context/ChannelContext";
import Header from "@/components/large/header";

export const metadata: Metadata = {
	title: "Upload Video - Vid Platform",
	description:
		"Upload your videos to Vid Platform and share them with the world.",
};

const getChannel = async () => {
	const headerlist = await headers();
	const headerValue = headerlist.get("x-user-name");
	if (!headerValue) {
		return null;
	}
	const username = headerValue;
	const channels = await getChannels(username);
	return channels;
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const channel = await getChannel();

	return (
        <>
				{channel !== null ? (
					<>
						<ChannelContextProvider initialValue={channel}>
                            <Header showChannel={true}/>
							{children}
						</ChannelContextProvider>
					</>
				) : (
					children
				)}
                </>
	);
}
