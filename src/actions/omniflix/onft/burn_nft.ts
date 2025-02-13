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
import burnNFTExamples from "../../../action_examples/omniflix/onft/burn_nft.ts";

export interface burnNFTContent extends Content {
    id: string;
    denomId: string;
}
interface validationResult {
    success: boolean;
    message: string;
}

function isBurnNFTContent(content: Content): validationResult {
    let msg = "";
    if (!content.id) {
        msg += "Please provide a NFT id to burn the NFT.";
    }
    if (!content.denomId) {
        msg += "Please provide a denom id for the of given NFT.";
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

const burnNFTTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "id": "onft..",
   "denomId": "onftdenom.."
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested collection creation:
- id mentioned in the current message
- denomId mentioned in the current message

Respond with a JSON markdown block containing only the extracted values.`;

export class burnNFTAction {
    async burnNFT(
        params: burnNFTContent,
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
            const response = await onftProvider.burnONFT(
                params.id,
                params.denomId
            );
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }
            return response.transactionHash;
        } catch (error) {
            throw new Error(`NFT Burn failed: ${error.message}`);
        }
    }
}

const buildBurnNFTDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<burnNFTContent> => {
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const burnNFTContext = composeContext({
        state: currentState,
        template: burnNFTTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: burnNFTContext,
        modelClass: ModelClass.SMALL,
    });

    const burnNFTContent = content as burnNFTContent;

    return burnNFTContent;
};

export default {
    name: "BURN_ONFT",
    similes: [
        "burn NFT",
    ],
    description: "Burn a NFT.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting BURN_NFT handler...");
        const burnNFTDetails = await buildBurnNFTDetails(
            runtime,
            message,
            state
        );
        const validationResult = isBurnNFTContent(burnNFTDetails);
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
            const action = new burnNFTAction();
            const txHash = await action.burnNFT(
                burnNFTDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = burnNFTDetails.id;
                let recipient = burnNFTDetails.recipient;

                callback({
                    text: `Successfully burned NFT ${id} & hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to burn NFT: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: burnNFTExamples,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: burnNFTExamples as ActionExample[][],
} as Action;
