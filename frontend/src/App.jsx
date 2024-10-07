import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'
import CarPriceComparisonGraph from './Graph'
import ParentComponent from './ParentComponent'


axios.defaults.baseURL = 'http://localhost:3000';
axios.defaults.withCredentials = true;
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <ParentComponent/>
    </>
  )
}

export default App
