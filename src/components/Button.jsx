import React from 'react'

export default function Button({
  bgColor = "#1b1e1f",
  textColor = "#e6ffffff",
  hoverColor = "#000",
  children = "How It Works",
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer z-10 px-6 font-normal py-2.5 rounded-xl transition-all duration-300 transform text-base`}
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverColor}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
    >
      {children}
    </button>
  )
}
