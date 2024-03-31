import { useSignAndExecuteTransactionBlock, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import supabase from './components/supabase';
import { useEffect, useState } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";

const package_id = '0x8d6acf918d2a3eeda02c44f086fe96d8878c5f627a7b2c19b3f4ac3ccb36ee16';


function Market() {
    return (
        <div>
            <h1>Market</h1>
            <ListObjects />
        </div>
    )
}

function ListObjects() {
    const account = useCurrentAccount();
    const [tracks, setTracks] = useState<any[] | null>([]);
    const suiClient = useSuiClient();
    const { mutate: signAndExcute } = useSignAndExecuteTransactionBlock();

    useEffect(() => {
        fetchTracks();
    }, []);

    async function fetchTracks() {
        let { data: tracks, error } = await supabase
            .from('TracksDB')
            .select('*')
            .eq('forSale', true);

        if (error) console.log('Error: ', error);
        else setTracks(tracks);
        console.log(tracks)
    }

    return (
        <div>
            {tracks && tracks.map((track, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '3px', border: '1px solid black', margin: '5px' }}>
                    <p style={{ marginRight: '30px', marginLeft: '30px' }}>Song Name: {track?.song_name}</p>
                    <p style={{ marginRight: '30px', marginLeft: '30px' }}>Creator: {track?.creator}</p>
                    <p style={{ marginRight: '30px', marginLeft: '30px' }}>Genre: {track?.genre}</p>
                    <button style={{ marginLeft: '10px' }} onClick={() => handleBuy(track?.objectId, track?.marketId, track?.price)}>PURCHASE</button>
                </div>
            ))}
        </div>
    )
    
    function handleBuy(objectId: string, marketId: string, price: string) {

        if (!account) {
            return (alert('Please connect your wallet to purchase the track'));
        }
    
        const txb = new TransactionBlock();
        console.log('Buying: ', objectId);
        console.log('Market ID: ', marketId);
        txb.moveCall({
            arguments: [txb.object(marketId), txb.object(objectId), txb.pure(price)],
            target: `${package_id}::marketplace::buy_and_take`,
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
                    await suiClient.waitForTransactionBlock({
                        digest: tx.digest,
                    });

                    console.log("Bought Music")
                    const objId = tx.effects?.created?.[0]?.reference?.objectId ?? '';
                    await supabase.from('TracksDB').update({ forSale: false}).eq('objectId', objId);
                }
            }
        );
        
    }

}

export default Market;