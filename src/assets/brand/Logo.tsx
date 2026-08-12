import React from 'react'
import { NavLink } from 'react-router-dom'
import logoWebp from './logo.webp'
import logoPng from './logo.png'

interface LogoProps {
  className?: string
  width?: number | string
  height?: number | string
  noLink?: boolean
}

export const Logo = ({ className = '', width = 'auto', height = 'auto', noLink = false }: LogoProps) => {
  const content = (
    <picture style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <source srcSet={logoWebp} type="image/webp" />
      <img 
        src={logoPng} 
        alt="Cake Pop Rush Logo" 
        style={{ width, height, maxWidth: '100%', objectFit: 'contain', display: 'block' }} 
      />
    </picture>
  )

  if (noLink) {
    return <div className={className} style={{ display: 'inline-flex', alignItems: 'center' }}>{content}</div>
  }

  return (
    <NavLink 
      to="/" 
      className={className}
      aria-label="CakePopRush Home"
      style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
    >
      {content}
    </NavLink>
  )
}

