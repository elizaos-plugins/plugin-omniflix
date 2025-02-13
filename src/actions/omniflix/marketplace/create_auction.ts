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
import createAuctionExamples from "../../../action_examples/omniflix/marketplace/create_auction.ts";

export interface createAuctionContent extends Content {
    nftId: string;
    denomId: string;
    denom: string;
    amount: number | string;
    duration: number;
    incrementPercentage: number;
    whitelistAccounts: Array<String>;
    splitShares: Array<Object>;
}
interface validationResult {
    success: boolean;
    message: string;
}

function isCreateAuctionContent(content: Content): validationResult {
    const missingFields: string[] = [];

    if (!content.nftId) {
        missingFields.push("nftId");
    } else if (!(content.nftId as string).startsWith("onft")) {
        missingFields.push("valid nftId");
    }
    if (!content.denomId) {
        missingFields.push("denomId");
    } else if (!(content.denomId as string).startsWith("onftdenom")) {
        missingFields.push("valid denomId");
    }
    if (!content.denom) {
        missingFields.push("denom");
    }
    if (!content.amount) {
        missingFields.push("amount");
    }
    if (!content.duration) {
        missingFields.push("duration");
    }
    if (!content.incrementPercentage) {
        missingFields.push("incrementPercentage");
    }

    if (missingFields.length > 0) {
        return {
            success: false,
            message: `Please provide the following: ${missingFields.join(", ")}.`,
        };
    }

    return {
        success: true,
        message: "Create auction request is valid.",
    };
}

const createAuctionTemplate = `Respond with a JSON markdown block containing only the extracted values. Take all the values from the current messages. Please provide the following information:

- nftId: (required) Please provide the nftId.
- denomId: (required) Please provide the denomId.
- denom: (optional) Please provide the denom.
- amount: (required) Please provide the amount.
- duration: (required) Please provide the duration.
- incrementPercentage: (required) Please provide the increment percentage.

Example response:
\`\`\`json
{
   "nftId": "onft..",
   "denomId": "onftdenom..",
   "denom": "uflix...",
   "amount": "1000000...",
   "duration": 10,
   "incrementPercentage": 10
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the required information about the requested create auction NFT.`;

export class createAuctionAction {
    async createAuction(
        params: createAuctionContent,
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
            if (params.incrementPercentage === undefined) {
                params.incrementPercentage = params.incrementPercentage/ 100;
            }
            if (params.denom === "FLIX" || params.denom === "flix") {
                params.denom = "uflix";
                if (typeof params.amount === "number") {
                    params.amount = params.amount * 1000000;
                } else if (typeof params.amount === "string") {
                    params.amount = Number.parseInt(params.amount) * 1000000;
                }
            }
            const response = await marketPlaceProvider.createAuction(
                params.nftId,
                params.denomId,
                params.denom,
                params.amount,
                params.duration,
                params.incrementPercentage,
                params.whitelistAccounts || [],
                params.splitShares || []
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

const buildCreateAuctionDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<createAuctionContent> => {
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const createAuctionContext = composeContext({
        state: currentState,
        template: createAuctionTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: createAuctionContext,
        modelClass: ModelClass.SMALL,
    });

    const createAuctionContent = content as createAuctionContent;

    return createAuctionContent;
};

export default {
    name: "CREATE_AUCTION",
    similes: [
        "create auction",
    ],
    description: "create an auction.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting CREATE_AUCTION handler...");
        const createAuctionDetails = await buildCreateAuctionDetails(
            runtime,
            message,
            state
        );
        console.log("createAuctionDetails", createAuctionDetails);
        const validationResult = isCreateAuctionContent(createAuctionDetails);
        console.log("validationResult", validationResult);
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
            const action = new createAuctionAction();
            const txHash = await action.createAuction(
                createAuctionDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                callback({
                    text: `✅ Successfully created auction & hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to create auction: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: createAuctionExamples,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: createAuctionExamples as ActionExample[][],
} as Action;
