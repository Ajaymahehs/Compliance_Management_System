import './App.css';
import About from './component/about';
import Home from './component/home';
import Department from './component/dept';
import Products from './component/product';

function App() {
  return (
    <div className="App">
      <Home/>
      <About/>
      <Products/>
      <Department/>
    </div>
  );
}

export default App;
