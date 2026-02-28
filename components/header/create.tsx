"use client"
import { Plus } from 'lucide-react'
import Link from 'next/link';
import React, { useState } from 'react'

const Create = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div className="flex items-center gap-2 relative">
      <button className="text-gray-600 flex justify-center items-center gap-2 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none" onClick={() => setDropdownOpen(!dropdownOpen)}>
        <Plus className="cursor-pointer" /> Create
      </button>
      {dropdownOpen && (
        <div className="absolute top-full right-[-8] mt-2 w-48 bg-white shadow-lg rounded-md">
          <div className="py-1">
            <Link href="/upload-video" className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Upload Video</Link>
            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Create Playlist</button>
            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Create Channel</button>
            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Create Post</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Create