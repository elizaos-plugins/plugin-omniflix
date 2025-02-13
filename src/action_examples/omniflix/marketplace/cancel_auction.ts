export default[
    [
        {
            user: "{{user1}}",
            content: { text: "Cancel auction" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll help you cancel an auction. Please provide the auction id.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "230" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Given auction id is '230'.",
                action: "CANCEL_AUCTION"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "Cancel auction, auction id: 230" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I will cancel the auction with id '230'.",
                action: "CANCEL_AUCTION"
            }
        }
    ]
]