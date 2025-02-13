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
import { v4 as uuidv4 } from 'uuid';
import { WalletProvider, walletProvider } from "../../../providers/wallet.ts";
import { MarketPlaceProvider } from "../../../providers/omniflix/marketplace.ts";
import listNFTExamples from "../../../action_examples/omniflix/marketplace/list_nft.ts";
const genUniqueID = (prefix) => {
    return prefix + uuidv4().replace(/-/g, '');
};

export interface listNFTContent extends Content {
    nftId: string;
    denomId: string;
    denom: string;
    amount: number | string;
    splitShares: Array<Object>;
}
interface validationResult {
    success: boolean;
    message: string;
}

function isListNFTContent(content: Content): validationResult {
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

    if (missingFields.length > 0) {
        const message = `Please provide ${missingFields.join(", ")} for the given NFT.`;
        return {
            success: false,
            message: message,
        };
    }
    return {
        success: true,
        message: "List NFT request is valid.",
    };
}

const listNFTTemplate = `Respond with a JSON markdown block containing only the extracted values.Take all the values from the current messages, Dont consider the example values.

Example response:
\`\`\`json
{
   "nftId": "onft..",
   "denomId": "onftdenom..",
   "denom": "uflix",
   "amount": "1000000"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested list NFT from the current messages:
- nftId : dont take example value  (required) ask for the nftId not consider from example
- denomId : dont take example value  (required) ask for the denomId not consider from example
- amount : mentioned in the current message or recent messages (if any)
- denom : mentioned in the current message or recent messages (if any)

Respond with a JSON markdown block containing only the extracted values from the current messages.`;

export class listNFTAction {
    async listNFT(
        params: listNFTContent,
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
            const response = await marketPlaceProvider.listNFT(
                genUniqueID("list"),
                params.nftId,
                params.denomId,
                params.denom,
                params.amount,
                params.splitShares || []
            );

            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }

            return response.transactionHash;
        } catch (error) {
            throw new Error(`${error.message}`);
        }
    }
}

const buildListNFTDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<listNFTContent> => {
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const listNFTContext = composeContext({
        state: currentState,
        template: listNFTTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: listNFTContext,
        modelClass: ModelClass.SMALL,
    });

    const listNFTContent = content as listNFTContent;

    return listNFTContent;
};

export default {
    name: "LIST_NFT",
    similes: [
        "list NFT",
    ],
    description: "List a NFT.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting LIST_NFT handler...");
        const listNFTDetails = await buildListNFTDetails(
            runtime,
            message,
            state
        );
        const validationResult = isListNFTContent(listNFTDetails);
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
            const action = new listNFTAction();
            const txHash = await action.listNFT(
                listNFTDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = listNFTDetails.nftId;
                callback({
                    text: `✅Successfully listed NFT ${id} & hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to list NFT: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: listNFTExamples,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: listNFTExamples as ActionExample[][],
} as Action;
