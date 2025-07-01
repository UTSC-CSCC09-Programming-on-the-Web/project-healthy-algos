import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './styles/App.css'
import AppRouter from './routes/AppRouter'

function App() {
  const [count, setCount] = useState(0)
  return <AppRouter />
}

export default App

// import AppRouter from './routes/AppRouter'

// function App() {
//   return (
//     <>
//       <div style={{ color: 'red' }}>Hello from App.jsx</div>
//       <AppRouter />
//     </>
//   );
// }

// export default App