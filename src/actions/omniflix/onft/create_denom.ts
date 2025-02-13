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
import { v4 as uuidv4 } from 'uuid';
import createDenomExamples from "../../../action_examples/omniflix/onft/create_denom.ts";
const genUniqueID = (prefix) => {
    return prefix + uuidv4().replace(/-/g, '');
};

export interface createDenomContent extends Content {
    name: string;
    symbol: string;
    description?: string;
    previewUri?: string;
    schema?: string;
    uri?: string;
    uriHash?: string;
    data?: string;
}

interface validationResult {
    success: boolean;
    message: string;
}

function isCreateDenomContent(content: Content): validationResult {
    let msg = "";
    if (!content.name) {
        msg += "Please provide a collection name for the creation of collection request.";
    }
    if (!content.symbol) {
        msg += "Please provide a symbol for the creation of collection request.";
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

const createDenomTemplate = `Respond with a JSON markdown block containing only the extracted values.

Example response:
\`\`\`json
{
   "name": "My Collection",
   "symbol": "MYCOL"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested collection creation:
- name mentioned in the current message
- symbol mentioned in the current message

Respond with a JSON markdown block containing only the extracted values.`;

export class createDenomAction {
    async createDenom(
        params: createDenomContent,
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
            const response = await onftProvider.createDenom(
                genUniqueID("onftdenom"),
                params.name,
                params.symbol.toUpperCase(),
                params.description || '',
                params.previewUri || '',
                params.schema || '',
                params.uri || '',
                params.uriHash || '',
                params.data || '',
            );
            if (response.code !== 0) {
                throw new Error(`${response.rawLog}`);
            }

            return response.transactionHash;
        } catch (error) {
            throw new Error(`Create Denom failed: ${error.message}`);
        }
    }
}

const buildCreateDenomDetails = async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
): Promise<createDenomContent> => {

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

    const createDenomContext = composeContext({
        state: currentState,
        template: createDenomTemplate,
    });

    const content = await generateObjectDeprecated({
        runtime,
        context: createDenomContext,
        modelClass: ModelClass.SMALL,
    });

    const createDenomContent = content as createDenomContent;

    return createDenomContent;
};

export default {
    name: "CREATE_DENOM",
    similes: [
        "create collection",
        "create  testCollection, testsymbol",
    ],
    description: "Create a new collection.",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback?: HandlerCallback
    ) => {
        elizaLogger.log("Starting CREATE_DENOM handler...");
        const createDenomDetails = await buildCreateDenomDetails(
            runtime,
            message,
            state
        );
        const validationResult = isCreateDenomContent(createDenomDetails);
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
            const action = new createDenomAction();
            const txHash = await action.createDenom(
                createDenomDetails,
                runtime,
                message,
                state
            );
            state = await runtime.updateRecentMessageState(state);

            if (callback) {
                let name = createDenomDetails.name;
                let symbol = createDenomDetails.symbol;

                callback({
                    text: `Successfully created ${name} ${symbol} with hash: ${txHash}`,
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
    template: createDenomTemplate,
    validate: async (_runtime: IAgentRuntime) => {
        return true;
    },
    examples: createDenomExamples as ActionExample[][],
} as Action;
