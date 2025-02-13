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
import placeBidExamples from "../../../action_examples/omniflix/marketplace/place_bid.ts";

export interface placeBidContent extends Content {
    auctionId: string;
    denom: string;
    amount: string | number;
}
interface validationResult {
    success: boolean;
    message: string;
}

function isPlaceBidContent(content: Content): validationResult {
    const missingFields: string[] = [];
    if (!content.auctionId) {
        missingFields.push("auctionId");
    }
    if (!content.amount) {
        missingFields.push("amount");
    }
    if (!content.denom) {
        missingFields.push("denom");
    }
    if (missingFields.length > 0) {
        return {
            success: false,
            message: `Please provide the following fields: ${missingFields.join(", ")}.`,
        };
    }
    return {
        success: true,
        message: "Place Bid request is valid.",
    };
}

const placeBidTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "auctionId": "auction..",
   "amount": "100",
    "denom": "uflix"
   "bidder": "omniflix1abc123..."
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested place bid:
- auctionId : dont take example value  (required) ask for the auctionId not consider from example
- amount : mentioned in the current message or recent messages (if any)
- denom : mentioned in the current message or recent messages (if any)

Respond with a JSON markdown block containing only the extracted values.`;

export class placeBidAction {
    async placeBid(
        params: placeBidContent,
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
                    const parsedAmount = Number.parseFloat(params.amount);
                    if (!isNaN(parsedAmount)) {
                        params.amount = parsedAmount * 1000000;
                    } else {
                        throw new Error("Invalid amount provided.");
                    }
                }
            }
            const response = await marketPlaceProvider.placeBid(
                params.auctionId,
                params.denom,
                params.amount,
            );
            if (!response || response.code !==0) {
                throw new Error(`${response.rawLog}`);
            }

            return response.transactionHash;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
}

const buildPlaceBidDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<placeBidContent> => {
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const placeBidContext = composeContext({
        state: currentState,
        template: placeBidTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: placeBidContext,
        modelClass: ModelClass.SMALL,
    });

    const placeBidContent = content as placeBidContent;

    return placeBidContent;
};

export default {
    name: "PLACE_BID",
    similes: [
        "place bid",
    ],
    description: "Place a bid.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting PLACE_BID handler...");
        const placeBidDetails = await buildPlaceBidDetails(
            runtime,
            message,
            state
        );
        const validationResult = isPlaceBidContent(placeBidDetails);
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
            const action = new placeBidAction();
            const txHash = await action.placeBid(
                placeBidDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = placeBidDetails.listId;
                callback({
                    text: `✅ Successfully placed bid ${id} & hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to place bid: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: placeBidExamples,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: placeBidExamples as ActionExample[][],
} as Action;
