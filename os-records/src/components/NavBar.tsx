import { ConnectButton } from '@mysten/dapp-kit'
import { Link } from 'react-router-dom';
import './NavBar.css'

function NavBar() {
  

  return (
    <div className="navbar">
      <p> OS Records</p>
      <Link to="/">Home</Link>
      <Link to="/market">Market</Link>
      <Link to="/mytracks">MyTracks</Link>
      <ConnectButton />
    </div>
  );
}

export default NavBar;