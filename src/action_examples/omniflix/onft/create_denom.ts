export default [
    [
        {
            user: "{{user1}}",
            content: { text: "Create a collection named MyCollection with symbol MCL" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll create a collection with name 'MyCollection' and symbol 'MCL' for you now.",
                action: "CREATE_DENOM"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "Create collection" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "To create a collection, I need both the collection name and symbol. Could you please provide those?",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "Name: ArtGallery, Symbol: ART" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll create a collection with name 'ArtGallery' and symbol 'ART' for you now.",
                action: "CREATE_DENOM"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "Create a new NFT collection" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll help you create an NFT collection. Please provide the collection name and symbol you'd like to use.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "Name: ArtGallery" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll create a collection with name 'ArtGallery' but i need collection symbol also.Please provide the symbol",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "Symbol: ART" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll create a collection with name 'ArtGallery' and symbol 'ART' for you now.",
                action: "CREATE_DENOM"
            }
        }
    ],
    [
        {
            user: "{{user1}}",
            content: { text: "Create collection name: testing1" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "could you please provide the symbol for the collection.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "Symbol: TEST1" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll create a collection with name 'testing1' and symbol 'TEST1' for you now.",
                action: "CREATE_DENOM"
            }
        }
    ]
]