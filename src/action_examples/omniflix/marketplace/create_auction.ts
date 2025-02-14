export default [
    [
        {
            user: "{{user1}}",
            content: { text: "Create an auction" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll create an auction. Please provide the NFTId, denomId, startPrice, duration and incrementPercentage.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "id: onft..." }
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
                text: "Given denomId is 'onftdenom'. Please provide startPrice.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "startPrice: 10FLIX..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given startPrice is amount: 10 denom: FLIX. Please provide duration.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "duration: 10" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given duration is '10'.Please provide incrementPercentage.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "incrementPercentage: 10%" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given incrementPercentage is '10%'.I will create the auction.",
                action: "CREATE_AUCTION"
            }
        },
    ]
]