import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ConnectButton, useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit'
import './App.css'
import './index.css'
import NavBar from './components/NavBar.tsx'
import Home from './Home.tsx'
import Market from './Market.tsx'
import MyTracks from './MyTracks.tsx'

function App() {
  const [count, setCount] = useState(0)

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

function ConnectedAccount() {
	const account = useCurrentAccount();

	if (!account) {
		return null;
	}

	return (
		<div>
			<div>Connected to {account.address}</div>;
			<OwnedObjects address={account.address} />
		</div>
	);
}

function OwnedObjects({ address }: { address: string }) {
	const { data } = useSuiClientQuery('getOwnedObjects', {
		owner: address,
	});
	if (!data) {
		return null;
	}

	return (
		<ul>
			{data.data.map((object) => (
				<li key={object.data?.objectId}>
					<a href={`https://example-explorer.com/object/${object.data?.objectId}`}>
						{object.data?.objectId}
					</a>
				</li>
			))}
		</ul>
	);
}

export default App
