import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import RockEval from './pages/RockEval'
import AAS from './pages/AAS'
import Convert from './pages/Convert'
import Mineral from './pages/Mineral'
import Synthesis from './pages/Synthesis'
import GeoMap from './pages/GeoMap'

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/rock-eval" element={<RockEval />} />
        <Route path="/aas"       element={<AAS />} />
        <Route path="/convert"   element={<Convert />} />
        <Route path="/mineral"   element={<Mineral />} />
        <Route path="/synthesis" element={<Synthesis />} />
        <Route path="/map"       element={<GeoMap />} />
      </Routes>
    </>
  )
}
