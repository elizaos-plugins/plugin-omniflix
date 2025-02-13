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
import { Coin } from "@cosmjs/stargate";
import { WalletProvider, walletProvider } from "../../../providers/wallet.ts";
import { MarketPlaceProvider } from "../../../providers/omniflix/marketplace.ts";
import buyNFTExamples from "../../../action_examples/omniflix/marketplace/buy_nft.ts";

export interface buyNFTContent extends Content {
    listId: string;
    amount: number | string;
    denom: string;
}
interface validationResult {
    success: boolean;
    message: string;
}

function isBuyNFTContent(content: Content): validationResult {
    const missingFields: string[] = [];

    if (!content.listId) {
        missingFields.push("listId");
    } else if (!(content.listId as string).startsWith("list")) {
        missingFields.push("valid listId");
    }
    if (!content.amount) {
        missingFields.push("amount");
    }
    if (!content.denom) {
        missingFields.push("denom");
    }
    if (missingFields.length > 0) {
        const message = `Please provide ${missingFields.join(", ")} for the given NFT to Buy NFT.`;
        return {
            success: false,
            message: message,
        };
    }
    return {
        success: true,
        message: "Buy NFT request is valid.",
    };
}

const buyNFTTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "listId": "list..",
    "amount": "100",
    "denom": "uflix"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested buy NFT:
- listId : dont take example value (required) ask for the listId
- denom : dont take example value (required) ask for the denom
- amount : dont take example value (required) ask for the amount

Respond with a JSON markdown block containing only the extracted values.`;

export class buyNFTAction {
    async buyNFT(
        params: buyNFTContent,
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
            if (params.denom === "FLIX" || params.denom === "flix") {
                params.denom = "uflix";
                if (typeof params.amount === "number") {
                    params.amount = params.amount * 1000000;
                } else if (typeof params.amount === "string") {
                    params.amount = Number.parseInt(params.amount) * 1000000;
                }
            }
            const response = await marketPlaceProvider.buyNFT(
                params.listId,
                params.amount,
                params.denom
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

const buildBuyNFTDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<buyNFTContent> => {
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const buyNFTContext = composeContext({
        state: currentState,
        template: buyNFTTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: buyNFTContext,
        modelClass: ModelClass.SMALL,
    });

    const buyNFTContent = content as buyNFTContent;

    return buyNFTContent;
};

export default {
    name: "BUY_NFT",
    similes: [
        "buy NFT",
        "buy nft",
    ],
    description: "Buy a NFT.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting BUY_NFT handler...");
        const buyNFTDetails = await buildBuyNFTDetails(
            runtime,
            message,
            state
        );
        const validationResult = isBuyNFTContent(buyNFTDetails);
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
            const action = new buyNFTAction();
            const txHash = await action.buyNFT(
                buyNFTDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = buyNFTDetails.listId;
                callback({
                    text: `✅ Successfully buyed NFT ${id} & hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to buy NFT: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: buyNFTExamples,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: buyNFTExamples as ActionExample[][],
} as Action;
