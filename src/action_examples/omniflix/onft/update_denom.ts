export default [
    [
        {
            user: "{{user1}}",
            content: { text: "i want to update collection" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll update the collection.Please provide the collection id and fields want to update name, description and previewUri.",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "id: onftdenom.." }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "id: onftdenom.. and provide one of the field name, description and previewUri",
                action: "NONE"
            }
        },
        {
            user: "{{user1}}",
            content: { text: "anyfield: ArtGallery" }
        },
        {
            user: "{{FlixAgent}}",
            content: { 
                text: "I'll update the collection now.",
                action: "UPDATE_DENOM"
            }
        }
    ]
]