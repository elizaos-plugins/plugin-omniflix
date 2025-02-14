export default  [
    [
        {
            user: '{{user1}}',
            content: { text: "Transfer NFT" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the NFT for you.Please provide the NFT id, denomId and the recipient address.",
                action: "NONE"
            }
        },
        {
            user: '{{user1}}',
            content: { text: "onft..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given NFT id is 'onft'. Please provide denomId and the recipient address.",
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
                text: "Given denomId is 'denomid' NFT id is 'id'. Please provide the recipient address.",
                action: "NONE"
            }
        },
        {
            user: '{{user1}}',
            content: { text: "omniflix1..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the NFT with id 'onft' , denomId 'denomid' the address 'omniflix1...' for you now.",
                action: "TRANSFER_NFT"
            }
        }
    ]
]