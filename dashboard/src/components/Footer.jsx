import React from 'react'

function Footer() {
  return (
    <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500 flex-shrink-0">
      © {new Date().getFullYear()} DeepConnection
    </div>
  )
}

export default Footer
