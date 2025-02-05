import { Keypair, SystemProgram, Transaction, } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { TOKEN_2022_PROGRAM_ID, getMintLen, createInitializeMetadataPointerInstruction, 
    createInitializeMintInstruction, TYPE_SIZE, LENGTH_SIZE, ExtensionType,
    getAssociatedTokenAddressSync,createAssociatedTokenAccountInstruction,
    createMintToInstruction } from "@solana/spl-token"
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';


export function TokenLaunchpad() {
    const { connection } = useConnection();
    const wallet = useWallet();

    async function createToken() {

    const name=document.getElementById("name").value;
    const symbol=document.getElementById("symbol").value
    const image=document.getElementById("image").value
    const supply=document.getElementById("supply").value

        const mintKeypair = Keypair.generate();
        const metadata = {
            mint: mintKeypair.publicKey,
            name: name,
            symbol: symbol,
            uri: image,
            additionalMetadata: [],
        };

        const mintLen = getMintLen([ExtensionType.MetadataPointer]);
        const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            }),
            createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
            createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
            createInitializeInstruction({
                programId: TOKEN_2022_PROGRAM_ID,
                mint: mintKeypair.publicKey,
                metadata: mintKeypair.publicKey,
                name: metadata.name,
                symbol: metadata.symbol,
                uri: metadata.uri,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            }),
        );
            
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
        transaction.partialSign(mintKeypair);

        await wallet.sendTransaction(transaction, connection);
        console.log("token mint created at:",mintKeypair.publicKey.toBase58())

        const associatedToken = getAssociatedTokenAddressSync(
            mintKeypair.publicKey,
            wallet.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID,
        );
        
        console.log(associatedToken.toBase58());
        
        const transaction2 = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                wallet.publicKey,
                associatedToken,
                wallet.publicKey,
                mintKeypair.publicKey,
                TOKEN_2022_PROGRAM_ID,
            ),
        );
        
        await wallet.sendTransaction(transaction2, connection);
        
        const transaction3 = new Transaction().add(
            createMintToInstruction(mintKeypair.publicKey, associatedToken, wallet.publicKey, supply, [], TOKEN_2022_PROGRAM_ID)
        );
        
        await wallet.sendTransaction(transaction3, connection);
        console.log("minted")
    }

    return <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input className='inputText' type='text' placeholder='Name' id="name"></input> <br />
        <input className='inputText' type='text' placeholder='Symbol' id="symbol"></input> <br />
        <input className='inputText' type='text' placeholder='Image URL' id="image"></input> <br />
        <input className='inputText' type='text' placeholder='Initial Supply' id="supply"></input> <br />
        <button onClick={createToken} className='btn'>Create a token with solana</button>
    </div>
}
