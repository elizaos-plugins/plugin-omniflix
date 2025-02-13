export default [
    [
        {
            user: "{{user1}}",
            content: { text: "I want to mint a NFT." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Please provide the denomId for the NFT.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "onftdenom..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Please provide the name for the NFT.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "MyNFT" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Please provide the mediaUri for the NFT.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "ipfs://..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Please provide the transferable flag for the NFT.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "true" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll mint an NFT with the following information now.",
                action: "MINT_ONFT"
            }
        },
    ]
]