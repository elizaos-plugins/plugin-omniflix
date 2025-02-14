export default [
    [
        {
            user: "{{user1}}",
            content: { text: "List NFT" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll help you list an NFT. Please provide the NFT id and the denomId.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "onft..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'onft'. Please provide denomId.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "denomId: onftdenom..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'onft' and denomId is 'onftdenom'. Please provide the amount and denom.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "amount: 100 denom: FLIX" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll list the NFT with id 'onft', denomId 'onftdenom', amount '100', and denom 'FLIX' for you now.",
                action: "LIST_NFT"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "List NFT" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll help you list an NFT. Please provide the NFT id  and the denomId.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "onft..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'onft'. Please provide denomId .",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "denomId: onftdenom..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'onft' and denomId is 'onftdenom'. Please provide the amount and denom.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "amount: 100 denom: FLIX" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll list the NFT with id 'onft', denomId 'onftdenom', amount '100', and denom 'FLIX' for you now.",
                action: "LIST_NFT"
            }
        }
    ],
    [
        {
            user: "{{user2}}",
            content: { text: "I want to list my NFT." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Sure! Please provide the NFT id  and the denomId .",
                action: "NONE"
            }
        },
        {
            user: "{{user2}}",
            content: { text: "nftId: myNFT..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'myNFT'. Please provide denomId.",
                action: "NONE"
            }
        },
        {
            user: "{{user2}}",
            content: { text: "denomId: myDenom..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'myNFT' and denomId is 'myDenom'. Please provide the amount and denom.",
                action: "NONE"
            }
        },
        {
            user: "{{user2}}",
            content: { text: "amount: 200 denom: uflik" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll list the NFT with id 'myNFT', denomId 'myDenom', amount '200', and denom 'uflik' for you now.",
                action: "LIST_NFT"
            }
        }
    ],
    [
        {
            user: "{{user3}}",
            content: { text: "Can you help me list an NFT?" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Of course! Please provide the NFT id  and the denomId.",
                action: "NONE"
            }
        },
        {
            user: "{{user3}}",
            content: { text: "nftId: coolNFT..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'coolNFT'. Please provide denomId.",
                action: "NONE"
            }
        },
        {
            user: "{{user3}}",
            content: { text: "denomId: coolDenom..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'coolNFT' and denomId is 'coolDenom'. Please provide the amount  and denom.",
                action: "NONE"
            }
        },
        {
            user: "{{user3}}",
            content: { text: "amount: 50 denom: FLIX" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll list the NFT with id 'coolNFT', denomId 'coolDenom', amount '50', and denom 'FLIX' for you now.",
                action: "LIST_NFT"
            }
        }
    ]
]