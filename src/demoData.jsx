
import { createContext, useContext, useEffect, useState } from 'react'

const DemoDataContext = createContext({ dataset: 'g8', setDataset: () => {} })

export function DemoDataProvider({ children }) {
  const [dataset, setDataset] = useState(() => localStorage.getItem('dataset') || 'g8')
  useEffect(() => { localStorage.setItem('dataset', dataset) }, [dataset])
  return <DemoDataContext.Provider value={{ dataset, setDataset }}>{children}</DemoDataContext.Provider>
}

export function useDemoData() {
  return useContext(DemoDataContext)
}
