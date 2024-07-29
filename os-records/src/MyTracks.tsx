import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClient, useSuiClientQuery } from '@mysten/dapp-kit'
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useEffect, useState } from 'react';
import { NFTStorage, File } from 'nft.storage';
import supabase from './components/supabase';


const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRlOUJBY0ExODg3RTkyZEQyRDMyN0YyYTg1QTIzQTJDNzNEZDIxMWUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwMzk2NTY4NTUyNywibmFtZSI6IlNvbGFuYSJ9.yNnJtQnl8lWs_18p1ezG0hsYSnhnHpx-lyD9tPYM05s';
const package_id = '0x8d6acf918d2a3eeda02c44f086fe96d8878c5f627a7b2c19b3f4ac3ccb36ee16';

function MyTracks() {
    return (
        <div>
            <h1>My Mixtapes</h1>
            <ConnectedAccount />
        </div>

    )
}

function ConnectedAccount() {
	const account = useCurrentAccount();

	if (!account) {
		return (
            <div>
                <p>Not connected</p>
                <p>Connect your wallet with button at top right to view your owned tracks</p>
            </div>
        )
	}

	return (
		<div>
			<div>Connected to {account.address}</div>
			<OwnedObjects address={account.address} />
            <div>----------</div>
            <CreateTrack />
		</div>
	);
}

function OwnedObjects({ address }: { address: string }) {
    const account = useCurrentAccount();
    const { data } = useSuiClientQuery('getOwnedObjects', {
        owner: address,
        filter: {
            MoveModule: {module: 'track', package: package_id}
        }
    }, );
    const { data: marketData } = useSuiClientQuery('getOwnedObjects', {
        owner: address,
        filter: {
            MoveModule: {module: 'marketplace', package: package_id}
        }
    }, );
    const [tracks, setTracks] = useState<any[]>([]);
    const suiClient = useSuiClient();
    const { mutate: signAndExcute } = useSignAndExecuteTransactionBlock();

    useEffect(() => {
        if (data) {
            const fetchTracks = async () => {
                const tracks = await Promise.all(data.data.map(async (object: any) => {
                    const { data, error } = await supabase.from('TracksDB').select('*').eq('objectId', object.data?.objectId).single();
                    if (error) {
                        console.log(error);
                        return null;
                    }
                    return data;
                }));
                setTracks(tracks);
            };
            fetchTracks();
        }
    }, [data]);

    if (!tracks) {
        console.log('No data');
        return <div>No Mixtapes Owned -- Make Some Music!</div>;
    }

    return (
        <div>
            <h3>Owned Mixtapes</h3>

            {tracks.map((track, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '3px', border: '1px solid black', margin: '5px' }}>
                    <p style={{ marginRight: '30px', marginLeft: '30px' }}>Song Name: {track?.song_name}</p>
                    <p style={{ marginRight: '30px', marginLeft: '30px' }}>Creator: {track?.creator}</p>
                    <p style={{ marginRight: '30px', marginLeft: '30px' }}>Genre: {track?.genre}</p>
                    {!track?.forSale ? (
                        <button style={{ marginRight: '30px', marginLeft: '30px' }} onClick={() => handleSellTrack(track?.objectId ?? '')}>Sell Mixtape</button>
                    ) : (
                        <p style={{ marginRight: '30px', marginLeft: '30px' }}>N/A</p>
                    )}
                    <button style={{ marginLeft: '10px' }} onClick={() => handleGetIPFSUrl(track?.objectId ?? '')}>Get IPFS URL</button>
                </div>
            ))}
        </div>
    );
    

                        
    async function handleSellTrack(objectId: string) {
        const price = prompt('Enter the price for the track');
    
        if (!account) {
            return (null)
        }
    
        let marketIdPromise: Promise<string>;
        const txb = new TransactionBlock();
        if (!marketData?.data || marketData?.data.length === 0) {
            console.log('No market found, creating new market...')
            marketIdPromise = new Promise(async (resolve) => {
                await txb.moveCall({
                    arguments: [],
                    target: `${package_id}::marketplace::create`, 
                    typeArguments: [`0x2::sui::SUI`]
                });
    
                await signAndExcute(
                    {
                        transactionBlock: txb,
                        options: {
                            showEffects: true,
                        },
                    },
                    {
                        onSuccess: async (tx) => {
                            await suiClient.waitForTransactionBlock({
                                digest: tx.digest,
                            });
    
                            console.log("Created New Market Struct")
                            const marketId = tx.effects?.created?.[0]?.reference?.objectId ?? '';
                            console.log(marketId);
                            await supabase.from('TracksDB').update({ marketId: tx.effects?.created?.[0]?.reference?.objectId}).eq('objectId', objectId);
                            resolve(marketId);
                        }
                    }
                );
            });
        }
        else {
            console.log('Market found')
            marketIdPromise = Promise.resolve(supabase.from('TracksDB').select('marketId').eq('objectId', objectId).single().then((res) => {
                return res.data?.marketId as string ?? '';
            }));
        }
    
        const marketId = await marketIdPromise;
        if (!marketId) {
            console.log('MarketId not found');
        }
    
        txb.moveCall({
            arguments: [txb.object(marketId), txb.pure(objectId), txb.pure(price)],
            target: `${package_id}::marketplace::list`,
            typeArguments: [`${package_id}::track::Track`, `0x2::sui::SUI`]
        });
    
        signAndExcute(
            {
                transactionBlock: txb,
                options: {
                    showEffects: true,
                },
            },
            {
                onSuccess: async (tx) => {
                    await suiClient
                        .waitForTransactionBlock({
                            digest: tx.digest,
                        })
                        .then(async () => {
                            await supabase.from('TracksDB').update({forSale: true , price: price }).eq('objectId', objectId);
                            alert(`Success! \nTrack with objectId: \n${objectId} is now for sale`);
                        });
                }
            }
        );
    }

    function handleGetIPFSUrl(objectId: string) {
        const txb = new TransactionBlock();

        let urlResult = txb.moveCall({
                arguments: [txb.pure(objectId)],
                target: `${package_id}::track::get_ipfsHash`
        });

        signAndExcute(
            {
                transactionBlock: txb,
                
                options: {
                    showEffects: true,
                },
            },
            {
                onSuccess: (tx) => {
                    suiClient
                        .waitForTransactionBlock({
                            digest: tx.digest,
                        })
                        .then(() => {
                            alert(`Success! \nIPFS URL of Track: \n${urlResult}`);
                            
                        });
                }
            }
        );
    }

}



async function storeNFT(image: File, name: string, description: string) {

    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

    // call client.store, passing in the image & metadata
    return nftstorage.store({
        name,
        description,
        image,
    });
}

function CreateTrack() {
    const suiClient = useSuiClient();
    const { mutate: signAndExcute } = useSignAndExecuteTransactionBlock();
    const [trackDetails, setTrackDetails] = useState({
        song_name: '',
        creator: '',
        genre: '',
        file: new File([], '', { type: '' })
    });
    const [ipfsHash, setIpfsHash] = useState('');

    const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        setTrackDetails({
            ...trackDetails,
            [event.currentTarget.name]: event.currentTarget.value,
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setTrackDetails({
                ...trackDetails,
                file: new File([file], file.name, { type: file.type })
            });
        }
        
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        create();
    };

    return (
        <div>
            <h3> Create New Mixtape </h3>
            <form onSubmit={handleSubmit}>
                <label>
                    Name:
                    <input type="text" name="song_name" value={trackDetails.song_name} onChange={handleInputChange} required />
                </label>
                <label>
                    Creator:
                    <input type="text" name="creator" value={trackDetails.creator} onChange={handleInputChange} required />
                </label>
                <label>
                    Genre:
                    <input type="text" name="genre" value={trackDetails.genre} onChange={handleInputChange} required />
                </label>
                <label>
                    Track File:
                    <input type="file" name="trackFile" onChange={handleFileChange} required />
                </label>
                <button type="submit" color='green'>Create Mixtape</button>
            </form>
        </div>
    );

    async function create() {
        let result = await storeNFT(trackDetails.file, trackDetails.song_name, trackDetails.creator);
        console.log(result);
        setIpfsHash(result.url);

        const txb = new TransactionBlock();

        txb.moveCall({
            arguments: [txb.pure(trackDetails.song_name), txb.pure(trackDetails.creator), txb.pure(trackDetails.genre), txb.pure(ipfsHash)],
            target: `${package_id}::track::mint_track`
        });

        signAndExcute({
            transactionBlock: txb,
            
            options: {
                showEffects: true,
            },
        },
        {
            onSuccess: async (tx) => {
                await suiClient
                    .waitForTransactionBlock({
                        digest: tx.digest,
                    })
                    .then(async () => {
                        const objectId = tx.effects?.created?.[0]?.reference?.objectId;
                        alert(`Success! \nNew Track created with objectId: \n${objectId}`);
                        // Read the existing data
                        await supabase.from('TracksDB').insert([ {objectId: objectId, song_name: trackDetails.song_name, creator: trackDetails.creator, genre: trackDetails.genre, forSale: false, marketId: null} ]);
                    });
            }
        }
        );

    }
}

export default MyTracks;
