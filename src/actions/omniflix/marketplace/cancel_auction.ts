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
import cancelAuctionExamples from "../../../action_examples/omniflix/marketplace/cancel_auction.ts";

export interface cancelAuctionContent extends Content {
    auctionId: string;
}
interface validationResult {
    success: boolean;
    message: string;
}

function isCancelAuctionContent(content: Content): validationResult {
    let msg = "";
    if (!content.auctionId) {
        msg += "Please provide auction id to cancel the auction.";
    }
    if (msg !== "") {
        return {
            success: false,
            message: msg,
        };
    }
    return {
        success: true,
        message: "Cancel auction request is valid.",
    };
}

const cancelAuctionTemplate = `Respond with a JSON markdown block containing only the extracted values.Take all the values from the current messages, Dont consider the example values.

Example response:
\`\`\`json
{
   "auctionId": "200.."
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested cancel auction from the current messages:
- auctionId mentioned in the current message, dont take example value (required)

Respond with a JSON markdown block containing only the extracted values.`;

export class cancelAuctionAction {
    async cancelAuction(
        params: cancelAuctionContent,
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
            const response = await marketPlaceProvider.cancelAuction(
                params.auctionId
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

const buildCancelAuctionDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<cancelAuctionContent> => {
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const cancelAuctionContext = composeContext({
        state: currentState,
        template: cancelAuctionTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: cancelAuctionContext,
        modelClass: ModelClass.SMALL,
    });

    const cancelAuctionContent = content as cancelAuctionContent;

    return cancelAuctionContent;
};

export default {
    name: "CANCEL_AUCTION",
    similes: [
        "cancel auction",
    ],
    description: "Cancel an auction.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting CANCEL_AUCTION handler...");
        const cancelAuctionDetails = await buildCancelAuctionDetails(
            runtime,
            message,
            state
        );
        const validationResult = isCancelAuctionContent(cancelAuctionDetails);
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
            const action = new cancelAuctionAction();
            const txHash = await action.cancelAuction(
                cancelAuctionDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = cancelAuctionDetails.auctionId;
                callback({
                    text: `✅Successfully cancelled auction ${id} & hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to cancel auction: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: cancelAuctionExamples,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: cancelAuctionExamples as ActionExample[][],
} as Action;
