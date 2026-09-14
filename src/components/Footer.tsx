import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-gray-100 py-6 text-center text-sm text-gray-600">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} MyWebsite. All rights reserved.</p>
      </div>
    </footer>
  )
}