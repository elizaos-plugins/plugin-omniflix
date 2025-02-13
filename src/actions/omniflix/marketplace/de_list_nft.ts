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
import { MarketPlaceProvider } from "../../../providers/omniflix/marketplace.ts";
import deListNFTExamples from "../../../action_examples/omniflix/marketplace/de_list_nft.ts";

export interface deListNFTContent extends Content {
    listId: string;
}
interface validationResult {
    success: boolean;
    message: string;
}

function isDeListNFTContent(content: Content): validationResult {
    let msg = "";
    if (!content.listId) {
        msg += "Please provide listId to de-list the NFT.";
    } else if (content.listId && !(content.listId as string).startsWith("list")) {
        msg += "Please provide a valid listId to de-list the NFT.";
    }
    if (msg !== "") {
        return {
            success: false,
            message: msg,
        };
    }
    return {
        success: true,
        message: "De-list NFT request is valid.",
    };
}

const deListNFTTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "listId": "list.."
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested de-list NFT:
- listId : mentioned in the current message or recent messages (if any)

Respond with a JSON markdown block containing only the extracted values.`;

export class deListNFTAction {
    async deListNFT(
        params: deListNFTContent,
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

            const marketPlaceProvider = new MarketPlaceProvider(wallet);
            const response = await marketPlaceProvider.deListNFT(
                params.listId
            );
            if (!response || response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }

            return response.transactionHash;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
}

const buildDeListNFTDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<deListNFTContent> => {
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const deListNFTContext = composeContext({
        state: currentState,
        template: deListNFTTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: deListNFTContext,
        modelClass: ModelClass.SMALL,
    });

    const deListNFTContent = content as deListNFTContent;

    return deListNFTContent;
};

export default {
    name: "DE_LIST_NFT",
    similes: [
        "de-list NFT",
    ],
    description: "De-list a NFT.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting DE_LIST_NFT handler...");
        const deListNFTDetails = await buildDeListNFTDetails(
            runtime,
            message,
            state
        );
        const validationResult = isDeListNFTContent(deListNFTDetails);
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
            const action = new deListNFTAction();
            const txHash = await action.deListNFT(
                deListNFTDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = deListNFTDetails.listId;
                callback({
                    text: `✅ Successfully de-listed NFT ${id} & hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to de-list NFT: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: deListNFTExamples,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: deListNFTExamples as ActionExample[][],
} as Action;
