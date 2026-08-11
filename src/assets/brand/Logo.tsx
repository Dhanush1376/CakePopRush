import React from 'react'
import { NavLink } from 'react-router-dom'
import logoImage from './logo.png'

interface LogoProps {
  className?: string
  width?: number | string
  height?: number | string
}

// This component API isolates the logo from the rest of the application
export const Logo = ({ className = '', width = 'auto', height = 'auto' }: LogoProps) => {
  return (
    <NavLink 
      to="/" 
      className={className}
      aria-label="CakePopRush Home"
      style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
    >
      <img src={logoImage} alt="Cake Pop Rush Logo" style={{ width, height, maxWidth: '100%', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply' }} />
    </NavLink>
  )
}
