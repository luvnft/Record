import { Route, Routes } from 'react-router-dom'
import './App.css'
import './index.css'
import NavBar from './components/NavBar.tsx'
import Home from './Home.tsx'
import Market from './Market.tsx'
import MyTracks from './MyTracks.tsx'

function App() {

  return (
    <div>
      <NavBar />
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/mytracks" element={<MyTracks />} />
      </Routes>
    </div>

  )
}



export default App
