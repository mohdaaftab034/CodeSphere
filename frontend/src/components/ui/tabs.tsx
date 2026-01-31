import React, { useState, createContext, useContext } from "react"
import "./tabs.css"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = "" }) => {
  return <div className={`tabs-list ${className}`}>{children}</div>
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsTrigger must be used within Tabs")

  const { value: activeValue, onValueChange } = context
  const isActive = activeValue === value

  return (
    <button
      className={`tabs-trigger ${isActive ? "active" : ""}`}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children }) => {
  const context = useContext(TabsContext)
  if (!context) throw new Error("TabsContent must be used within Tabs")

  const { value: activeValue } = context
  if (activeValue !== value) return null

  return <div className="tabs-content">{children}</div>
}
