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
import updateDenomExamples from "../../../action_examples/omniflix/onft/update_denom.ts";

export interface updateDenomContent extends Content {
    id: string;
    name: string;
    description?: string;
    previewUri?: string;
    royaltyReceivers?: Array<Object>;
}

interface validationResult {
    success: boolean;
    message: string;
}

function isUpdateDenomContent(content: Content): validationResult {
    let msg = "";
    if (!content.id) {
        msg += "Please provide a collection id for the update of collection.";
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

const updateDenomTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "id": "onftdenom..",
   "description": "test description"
   "previewUri": "ipfs://...",
   "royaltyReceivers": []
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested collection creation:
- id mentioned in the current message required
- name is mentioned in the current message optional
- description is mentioned in the current message optional
- previewUri is mentioned in the current message optional
- royaltyReceivers is mentioned in the current message optional

Respond with a JSON markdown block containing only the extracted values.`;

export class updateDenomAction {
    async updateDenom(
        params: updateDenomContent,
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
            const response = await onftProvider.updateDenom(
                params.id,
                params.name,
                params.description || '',
                params.previewUri || '',
                params.royaltyReceivers || []
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

const buildUpdateDenomDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<updateDenomContent> => {

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

    const updateDenomContext = composeContext({
        state: currentState,
        template: updateDenomTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: updateDenomContext,
        modelClass: ModelClass.SMALL,
    });

    const createDenomContent = content as updateDenomContent;

    return createDenomContent;
};

export default {
    name: "UPDATE_DENOM",
    similes: [
        "update collection",
        "update  testCollection",
    ],
    description: "Update a collection.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting UPDATE_DENOM handler...");
        const updateDenomDetails = await buildUpdateDenomDetails(
            runtime,
            message,
            state
        );
        const validationResult = isUpdateDenomContent(updateDenomDetails);
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
            const action = new updateDenomAction();
            const txHash = await action.updateDenom(
                updateDenomDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let id = updateDenomDetails.id;
                let name = updateDenomDetails.name;

                callback({
                    text: `Successfully updated ${name} ${id} with hash: ${txHash}`,
                    content: {
                        success: true,
                    },
                });
            }
            return true;
        } catch (error) {
            if (callback) {
                callback({
                    text: `Failed to create collection: ${error.message}`,
                    content: { error: error.message },
                });
            }
            return false;
        }
    },
    template: updateDenomTemplate,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: updateDenomExamples as ActionExample[][],
} as Action;
