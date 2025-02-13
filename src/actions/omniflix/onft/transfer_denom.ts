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
import transferDenomExamples from "../../../action_examples/omniflix/onft/transfer_denom.ts";

export interface transferDenomContent extends Content {
    id: string;
    recipient: string;
}

interface validationResult {
    success: boolean;
    message: string;
}

function isTransferDenomContent(content: Content): validationResult {
    let msg = "";
    if (!content.id) {
        msg += "Please provide a collection id for the transfer of collection.";
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

const transferDenomTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "id": "onftdenom..",
   "recipient": "omniflix1abc123..."
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested collection creation:
- id mentioned in the current message required
- recipient mentioned in the current message required

Respond with a JSON markdown block containing only the extracted values.`;

export class transferDenomAction {
    async transferDenom(
        params: transferDenomContent,
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
            const response = await onftProvider.transferDenom(
                params.id,
                params.recipient
            );
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }

            return response.transactionHash;
        } catch (error) {
            throw new Error(`Transfer failed: ${error.message}`);
        }
    }
}

const buildTransferDenomDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<transferDenomContent> => {

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

    const transferDenomContext = composeContext({
        state: currentState,
        template: transferDenomTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: transferDenomContext,
        modelClass: ModelClass.SMALL,
    });

    const transferDenomContent = content as transferDenomContent;

    return transferDenomContent;
};

export default {
    name: "TRANSFER_DENOM",
    similes: [
        "transfer collection",
        "send collection"
    ],
    description: "Transfer a collection.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting TRANSFER_DENOM handler...");
        const transferDenomDetails = await buildTransferDenomDetails(
            runtime,
            message,
            state
        );
        const validationResult = isTransferDenomContent(transferDenomDetails);
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
            const action = new transferDenomAction();
            const txHash = await action.transferDenom(
                transferDenomDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = transferDenomDetails.id;
                let recipient = transferDenomDetails.recipient;

                callback({
                    text: `Successfully transferred collection ${id} to ${recipient} with hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to transfer collection: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: transferDenomTemplate,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: transferDenomExamples as ActionExample[][],
} as Action;
