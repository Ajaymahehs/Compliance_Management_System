import './App.css';
import About from './component/about';
import Home from './component/home';
import Products from './component/product';

function App() {
  return (
    <div className="App">
      <Home/>
      <About/>
      <Products/>
    </div>
  );
}

export default App;
