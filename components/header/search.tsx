import React from "react";

const Search = () => {
	return (
		<div className="flex justify-center">
			<input
				type="text"
				placeholder="Search..."
				className="w-full mx-auto md:w-96 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-100"
			/>
		</div>
	);
};

export default Search;
