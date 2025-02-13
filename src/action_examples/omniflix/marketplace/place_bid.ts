export default [
    [
        {
            user: "{{user1}}",
            content: { text: "Place a bid" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll place a bid, Please provide the following information:\n1. Auction ID\n2. Amount\n3. Denom",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "auctionid: 230" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given auction id is '230'. Please provide amount and denom.",
                action: "PLACE_BID"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "amount: 100 denom: FLIX" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given amount is '100' and denom is 'FLIX'. I will place the bid.",
                action: "PLACE_BID"
            }
        },
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "Place a bid on auction with id 'auctionid' and amount 'amount'..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll place a bid on the auction with id 'auctionid' and amount 'amount'...",
                action: "PLACE_BID"
            }
        }
    ]
]