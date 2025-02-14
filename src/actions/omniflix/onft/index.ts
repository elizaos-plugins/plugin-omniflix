import { type Action } from "@elizaos/core";
import createDenom from "./create_denom.ts";
import updateDenom from "./update_denom.ts";
import transferDenom from "./transfer_denom.ts";
import mintONFT from "./mint_nft.ts";
import transferNFT from "./transfer_nft.ts";
import burnNFT from "./burn_nft.ts";

export const onftActions: Action[] = [
    createDenom, 
    updateDenom, 
    transferDenom, 
    mintONFT, 
    transferNFT,
    burnNFT
];
export default onftActions;
