module track::track {
    use std::string::String;
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::coin;
    use sui::sui::SUI;

    // track struct
    struct Track has key, store {
        id: UID,
        name: String,
        creator: String,
        genre: String,
        ipfsHash: String
    }

    struct TrackOwnerCap has key { id: UID }

    public fun mint_track(name: String, creator: String, genre: String, ipfsHash: String, ctx: &mut TxContext) {
        let id = object::new(ctx);

        let newtrack = Track { id, name, creator, genre, ipfsHash };
        transfer::public_transfer(newtrack, tx_context::sender(ctx));
    }

    // getters
    public fun name(track: &Track): String {track.name}
    public fun creator(track: &Track): String {track.creator}
    public fun genre(track: &Track): String {track.genre}

    // nonstandard getter only allowing the owner to get the ipfsHash
    public fun get_ipfsHash(track: &Track): String {track.ipfsHash}

}