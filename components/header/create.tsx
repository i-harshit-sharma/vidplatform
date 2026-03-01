"use client"
import { Plus } from 'lucide-react'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const Create = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(()=>{
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.create-dropdown') && !target.closest('.create-button')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  })
  return (
    <div className="flex items-center gap-2 relative">
      <button className="text-gray-600 flex rounded-full cursor-pointer items-center gap-1 pr-3 pl-2 border border-gray-200 py-2 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-800" onClick={() => setDropdownOpen(!dropdownOpen)}>
        <Plus className="w-5 h-5" />
        <span className="leading-none pb-0.5">Create</span>
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