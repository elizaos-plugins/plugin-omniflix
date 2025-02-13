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
import transferNFTExamples from "../../../action_examples/omniflix/onft/transfer_nft.ts";

export interface transferNFTContent extends Content {
    id: string;
    denomId: string;
    recipient: string;
}

interface validationResult {
    success: boolean;
    message: string;
}

function isTransferNFTContent(content: Content): validationResult {
    let msg = "";
    console.log('content', content);
    if (!content.id) {
        msg += "Please provide a collection id for the update of collection.";
    }
    if (!content.denomId) {
        msg += "Please provide a denom id for the update of collection.";
    }
    if (!content.recipient) {
        msg += "Please provide a recipient address for the transfer request.";
    } else {
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

const transferNFTTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "id": "onft..",
   "denomId": "onftdenom..",
   "recipient": "omniflix1abc123..."
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested collection creation:
- id mentioned in the current message required and don't take it from example
- denom Id in the current message required and don't take it from example
- recipient mentioned in the current message required and don't take it from example

Respond with a JSON markdown block containing only the extracted values.`;

export class transferNFTAction {
    async transferNFT(
        params: transferNFTContent,
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
            const response = await onftProvider.transferONFT(
                params.id,
                params.denomId,
                params.recipient
            );
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }
            return response.transactionHash;
        } catch (error) {
            throw new Error(`NFT Transfer failed: ${error.message}`);
        }
    }
}

const buildTransferNFTDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<transferNFTContent> => {

    // if (!state) {
    //     state = (await runtime.composeState(message)) as State;
    // } else {
    //     state = await runtime.updateRecentMessageState(state);
    // }
    
    let currentState: State = state;
    if (!currentState) {
        currentState = (await runtime.composeState(message)) as State;
    }
    currentState = await runtime.updateRecentMessageState(currentState);

    const transferNFTContext = composeContext({
        state: currentState,
        template: transferNFTTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: transferNFTContext,
        modelClass: ModelClass.SMALL,
    });

    const transferNFTContent = content as transferNFTContent;

    return transferNFTContent;
};

export default {
    name: "TRANSFER_NFT",
    similes: [
        "transfer the NFT",
        "send NFT"
    ],
    description: "Transfer a NFT.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting UPDATE_DENOM handler...");
        const transferNFTDetails = await buildTransferNFTDetails(
            runtime,
            message,
            state
        );
        const validationResult = isTransferNFTContent(transferNFTDetails);
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
            const action = new transferNFTAction();
            const txHash = await action.transferNFT(
                transferNFTDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = transferNFTDetails.id;
                let recipient = transferNFTDetails.recipient;

                callback({
                    text: `Successfully transferred NFT ${id} to ${recipient} with hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to transfer NFT: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: transferNFTTemplate,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: transferNFTExamples as ActionExample[][],
} as Action;
