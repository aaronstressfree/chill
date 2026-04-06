import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalStyles } from './theme/GlobalStyles';
import { MainWindow } from './components/windows/MainWindow';
import { BreakWindow } from './components/windows/BreakWindow';

function App() {
  return (
    <>
      <GlobalStyles />
      <Router>
        <Routes>
          <Route path="/" element={<MainWindow />} />
          <Route path="/break" element={<BreakWindow />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
