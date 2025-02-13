export default [
    [
        {
            user: "{{user1}}",
            content: { text: "i want to transfer collection" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the collection. Please provide the collection id and the recipient address.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "id: onftdenom.. and recipient address: omniflix1..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the collection with id 'onftdenom' to the address 'omniflix1...' for you now.",
                action: "TRANSFER_DENOM"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "i want to transfer collection" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the collection. Please provide the collection id and the recipient address.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "id: onftdenom." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "Got the collection id 'onftdenom. please provide the recipient address",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "omniflix1..." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the collection with id 'onftdenom' to the address 'omniflix1...' for you now.",
                action: "TRANSFER_DENOM"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "i want to transfer collection with id 'onftdenom' to the address 'omniflix1...' for you now." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the collection with id 'onftdenom' to the address 'omniflix1...' for you now. confirm the given details.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "yes." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll transfer the collection with id 'onftdenom' to the address 'omniflix1...' for you now. confirm the given details.",
                action: "TRANSFER_DENOM"
            }
        }
    ]
]