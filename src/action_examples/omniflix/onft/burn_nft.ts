export default [
    [
        {
            user: '{{user1}}', 
            content: { text: "I want to burn a NFT." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll help you burn a NFT. Please provide the NFT id and denomId.",
                action: "NONE"
            }
        },
        {
            user: '{{user1}}',
            content: { text: "id: onftdenom..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'onftdenom'. Please provide denomId.",
                action: "NONE"
            }
        },
        {
            user: '{{user1}}',
            content: { text: "denomId: denomid..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I Will burn the NFT.",
                action: "BURN_ONFT"
            }
        }
    ]
]