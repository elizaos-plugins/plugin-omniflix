export default [
    [
        {
            user: "{{user1}}",
            content: { text: "De-list NFT" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll help you de-list an NFT. Please provide the list id.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "list..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given list id is 'list'.",
                action: "DE_LIST_NFT"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "De-list NFT, list..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll de-list the NFT with list id 'list...'.",
                action: "DE_LIST_NFT"
            }
        }
    ]
]