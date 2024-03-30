import { Link } from 'react-router-dom';
import { ConnectButton } from '@mysten/dapp-kit'
import './NavBar.css'

function NavBar() {
  return (
    <div className="navbar">
      <p> OS Records</p>
      <a href="/">Home</a>
      <a href="/market">Market</a>
      <a href="/mytracks">MyTracks</a>
      <ConnectButton />
    </div>
  );
}

export default NavBar;