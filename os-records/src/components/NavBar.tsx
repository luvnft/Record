import { ConnectButton } from '@mysten/dapp-kit'
import { Link } from 'react-router-dom';
import './NavBar.css'

function NavBar() {
  

  return (
    <div className="navbar">
      <p> MIXTAPE</p>
      <Link to="/">HOME</Link>
      <Link to="/market">MARKET</Link>
      <Link to="/mytracks">MY MIXTAPES</Link>
      <ConnectButton />
    </div>
  );
}

export default NavBar;