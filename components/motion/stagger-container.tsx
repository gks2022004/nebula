'use client'

import { motion, HTMLMotionProps } from 'framer-motion'

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  delay?: number
  staggerDelay?: number
}

export function StaggerContainer({ 
  children, 
  delay = 0, 
  staggerDelay = 0.1,
  className = '',
  ...props 
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay
          }
        }
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      ease: [0.21, 0.47, 0.32, 0.98],
      duration: 0.5
    }
  }
}
