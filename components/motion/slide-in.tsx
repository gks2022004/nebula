'use client'

import { motion, HTMLMotionProps } from 'framer-motion'

interface SlideInProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  delay?: number
  duration?: number
  direction?: 'left' | 'right'
  fullWidth?: boolean
}

export function SlideIn({ 
  children, 
  delay = 0, 
  duration = 0.5, 
  direction = 'left',
  fullWidth = false,
  className = '',
  ...props 
}: SlideInProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        x: direction === 'left' ? -100 : 100
      }}
      whileInView={{ 
        opacity: 1, 
        x: 0 
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 20
      }}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}
