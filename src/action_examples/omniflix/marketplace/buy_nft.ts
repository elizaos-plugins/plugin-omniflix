export default [
    [
        {
            user: "{{user2}}",
            content: { text: "I want to buy an NFT." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Sure! Please provide the listId and amount.",
                action: "NONE"
            }
        },
        {
            user: "{{user2}}",
            content: { text: "listId: list123, amount: 5, denom: ETH" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll proceed to buy the NFT with list id 'list123' for '5 ETH'.",
                action: "BUY_NFT"
            }
        },
    ],
    [
        {
            user: "{{user5}}",
            content: { text: "Buy NFT now!" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Please provide the listId and amount to proceed.",
                action: "NONE"
            }
        },
        {
            user: "{{user5}}",
            content: { text: "listId: list789, amount: 3, denom: FLIX" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "✅ Successfully bought NFT with list id 'list789' for '3 FLIX'.",
                action: "BUY_NFT"
            }
        },
    ]
]