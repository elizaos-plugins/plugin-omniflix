import {
    elizaLogger,
    composeContext,
    Content,
    HandlerCallback,
    ModelClass,
    type Memory,
    type State,
    generateObjectDeprecated,
    ActionExample,
    Action,
    IAgentRuntime,
} from "@elizaos/core";
import { WalletProvider, walletProvider } from "../../../providers/wallet.ts";
import { ONFTProvider } from "../../../providers/omniflix/onft.ts";
import { bech32 } from "bech32";
import { v4 as uuidv4 } from 'uuid';
import mintONFTExamples from "../../../action_examples/omniflix/onft/mint_nft.ts";
const genUniqueID = (prefix) => {
    return prefix + uuidv4().replace(/-/g, '');
};

export interface mintONFTContent extends Content {
    denomId: string,
    name: string,
    mediaUri: string,
    previewUri?: string,
    uriHash?: string,
    description?: string,
    data?: string,
    transferable?: boolean,
    extensible?: boolean,
    nsfw?: boolean,
    royaltyShare?: string,
    recipient?: string,
}

interface validationResult {
    success: boolean;
    message: string;
}

function isMintONFTContent(content: Content): validationResult {
    console.log('isMintONFTContent', content);
    let msg = "";
    if (!content.denomId) {
        msg += "Please provide a collection id to be mint the NFT.";
    }
    if(!content.name){
        msg += "Please provide a name for the NFT.";
    }
    if(!content.mediaUri){
        msg += "Please provide a media URI for the NFT.";
    }
    if(!content.transferable){
        msg += "Please provide a valid boolean value for transferable flag.";
    }
    if (content.recipient) {
        try {
            const { prefix } = bech32.decode(content.recipient as string);
            if (prefix !== "omniflix") {
                msg +=
                    "Please provide a valid Omniflix address for the transfer request.";
            }
        } catch {
            msg +=
                "Please provide a valid Omniflix address for the transfer request.";
        }
    }
    if (msg !== "") {
        return {
            success: false,
            message: msg,
        };
    }
    return {
        success: true,
        message: "Collection request is valid.",
    };
}

const mintONFTTemplate = `Respond with a JSON markdown block containing only the extracted values. For required fields (name, mediaUri, denomId, transferable), Please Take from message. For boolean fields (transferable, extensible, nsfw), convert text 'true'/'false' to actual boolean values.

Example response:
\`\`\`json
{
   "name": "My NFT",
   "mediaUri": "ipfs://...",
   "previewUri": "",
   "denomId": "onftdenom..",
   "data": "{}",
   "transferable": true,
   "extensible": true,
   "nsfw": false,
   "royaltyShare": "1000000000000000"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested collection creation:
- name mentioned in the current message (required)
- mediaUri mentioned in the current message (required)
- denomId mentioned in the current message (required)
- transferable mentioned in the current message (required, convert to boolean)

Respond with a JSON markdown block containing only the extracted values.`;

export class mintONFTAction {
    async mintONFT(
        params: mintONFTContent,
        runtime: IAgentRuntime,
        message: Memory,
        state: State
    ): Promise<string> {
        try {
            const wallet: WalletProvider = await walletProvider.get(
                runtime,
                message,
                state,
            );

            const onftProvider = new ONFTProvider(wallet);
            const response = await onftProvider.mintONFT(
                genUniqueID("onft"),
                params.denomId,
                params.name,
                params.mediaUri,
                params.previewUri || '',
                params.uriHash || '',
                params.description || '',
                params.data || '{}',
                Boolean(params.transferable) || true,
                Boolean(params.extensible) || true,
                Boolean(params.nsfw) || false,
                params.royaltyShare || "10000000000000000",
                params.recipient
            );
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }
            return response.transactionHash;
        } catch (error) {
            throw new Error(`Mint failed: ${error.message}`);
        }
    }
}

const buildMintONFTDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<mintONFTContent> => {

    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const mintONFTContext = composeContext({
        state: currentState,
        template: mintONFTTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: mintONFTContext,
        modelClass: ModelClass.SMALL,
    });

    const mintONFTContent = content as mintONFTContent;

    return mintONFTContent;
};

export default {
    name: "MINT_ONFT",
    similes: [
        "mint NFT",
    ],
    description: "Mint a NFT.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting MINT_ONFT handler...");
        const mintONFTDetails = await buildMintONFTDetails(
            runtime,
            message,
            state
        );
        console.log('mintONFTDetails', mintONFTDetails);
        const validationResult = isMintONFTContent(mintONFTDetails);
        if (!validationResult.success) {
            if (callback) {
                callback({
                    text: validationResult.message,
                    content: { error: validationResult.message },
                });
            }
            return false;
        }
        try {
            const action = new mintONFTAction();
            const txHash = await action.mintONFT(
                mintONFTDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = mintONFTDetails.id;
                let name = mintONFTDetails.name;

                callback({
                    text: `Successfully minted NFT ${id} named ${name} with hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                console.log('error',error);
                callback({
                    text: `Failed to mint NFT: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: mintONFTTemplate,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: mintONFTExamples as ActionExample[][],
} as Action;
