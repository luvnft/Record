import { ConnectButton } from '@mysten/dapp-kit'
import { Link } from 'react-router-dom';
import './NavBar.css'

function NavBar() {
  

  return (
    <div className="navbar">
      <p> Mixtape</p>
      <Link to="/">Home</Link>
      <Link to="/market">Market</Link>
      <Link to="/mytracks">My Mixtapes</Link>
      <ConnectButton />
    </div>
  );
}

export default NavBar;