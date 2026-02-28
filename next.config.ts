import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [new URL("https://avatars.jakerunzer.com/**")],
	},
};

export default nextConfig;
