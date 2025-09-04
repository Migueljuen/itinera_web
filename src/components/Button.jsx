import React from 'react'

export default function Button({ 
  bgColor = "#274b46", 
  textColor = "white", 
  hoverColor = "#376a63", 
  children = "How It Works",
  onClick 
}) {
  return (
    <button
     onClick={onClick} 
      className={`cursor-pointer z-10 px-6 py-3 lg:px-8 lg:py-4 rounded-4xl transition-all duration-300 transform text-base`}
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
