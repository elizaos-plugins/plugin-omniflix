import { elizaLogger } from "@elizaos/core";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { WalletProvider } from "../wallet";
import { MsgListNFT, MsgDeListNFT, MsgBuyNFT, MsgCreateAuction, MsgPlaceBid, MsgCancelAuction } from '@omniflixnetwork/omniflixjs/OmniFlix/marketplace/v1beta1/tx';

export class MarketPlaceProvider {
    private wallet: WalletProvider;

    constructor(wallet: WalletProvider) {
        this.wallet = wallet;
    }

    async listNFT(
        id: string,
        nftId: string,
        denomId: string,
        denom: string,
        amount: number | string,
        splitShares: Array<Object>,
    ): Promise<DeliverTxResponse> {
        try {
            const address = await this.wallet.getAddress();
            const client = await this.wallet.getClient();
            if (!address) {
                throw new Error("Could not get address");
            }
            client.registry.register("/OmniFlix.marketplace.v1beta1.MsgListNFT", MsgListNFT);

            const list = {
                id,
                nftId,
                denomId,
                price: {
                    denom,
                    amount: amount.toString(),
                },
                owner: address,
                splitShares: []
            };
            const listNFTMsg = {
                typeUrl: '/OmniFlix.marketplace.v1beta1.MsgListNFT',
                value: list
            };
            const fee = {
                amount: [{
                    denom: 'uflix',
                    amount: '50000'
                }],
                gas: '5000000'
            };
            console.log("listNFTMsg", listNFTMsg);
            const tx = await client.signAndBroadcast(
                address,
                [listNFTMsg],
                fee,
                "listing NFT using Eliza"
            );
            return tx;
        } catch (e) {
            elizaLogger.error(`Error in listing NFT: ${e}`);
            throw e;
        }
    }

    async deListNFT(
        id: string,
    ): Promise<DeliverTxResponse> {
        try {
            const address = await this.wallet.getAddress();
            const client = await this.wallet.getClient();
            if (!address) {
                throw new Error("Could not get address");
            }
            client.registry.register("/OmniFlix.marketplace.v1beta1.MsgDeListNFT", MsgDeListNFT);

            const deList = {
                id,
                owner: address,
            };
            const deListNFTMsg = {
                typeUrl: '/OmniFlix.marketplace.v1beta1.MsgDeListNFT',
                value: deList
            };
            const fee = {
                amount: [{
                    denom: 'uflix',
                    amount: '50000'
                }],
                gas: '5000000'
            };
            const tx = await client.signAndBroadcast(
                address,
                [deListNFTMsg],
                fee,
                "de-listing NFT using Eliza"
            );
            return tx;
        } catch (e) {
            elizaLogger.error(`Error in de-listing NFT: ${e}`);
            throw e;
        }
    }

    async buyNFT(
        id: string,
        amount: number | string,
        denom: string,
    ): Promise<DeliverTxResponse> {
        try {
            const address = await this.wallet.getAddress();
            const client = await this.wallet.getClient();
            if (!address) {
                throw new Error("Could not get address");
            }
            client.registry.register("/OmniFlix.marketplace.v1beta1.MsgBuyNFT", MsgBuyNFT);

            const buyNFT = {
                id,
                price: {
                    denom,
                    amount: amount.toString(),
                },
                buyer: address,
            };
            const buyNFTMsg = {
                typeUrl: '/OmniFlix.marketplace.v1beta1.MsgBuyNFT',
                value: buyNFT
            };
            const fee = {
                amount: [{
                    denom: 'uflix',
                    amount: '50000'
                }],
                gas: '5000000'
            };
            const tx = await client.signAndBroadcast(
                address,
                [buyNFTMsg],
                fee,
                "buying NFT using Eliza"
            );
            return tx;
        } catch (e) {
            elizaLogger.error(`Error in buying NFT: ${e}`);
            throw e;
        }
    }

    async createAuction(
        nftId: string,
        denomId: string,
        denom: string,
        amount: number | string,
        duration: number,
        incrementPercentage: number,
        whitelistAccounts: Array<String>,
        splitShares: Array<Object>,
    ): Promise<DeliverTxResponse> {
        try {
            const address = await this.wallet.getAddress();
            const client = await this.wallet.getClient();
            if (!address) {
                throw new Error("Could not get address");
            }
            client.registry.register("/OmniFlix.marketplace.v1beta1.MsgCreateAuction", MsgCreateAuction);

            const createAuction = {
                nftId,
                denomId,
                startTime: { seconds: Math.floor((Date.now() + 120000) / 1000), nanos: 0 },
                startPrice: {
                    denom,
                    amount: amount.toString(),
                },
                duration: { seconds: duration, nanos: 0 },
                incrementPercentage,
                whitelistAccounts: whitelistAccounts || [],
                splitShares: splitShares || [],
                owner: address,
            };
            const createAuctionMsg = {
                typeUrl: '/OmniFlix.marketplace.v1beta1.MsgCreateAuction',
                value: createAuction
            };
            console.log(createAuctionMsg);
            const fee = {
                amount: [{
                    denom: 'uflix',
                    amount: '50000'
                }],
                gas: '5000000'
            };
            const tx = await client.signAndBroadcast(
                address,
                [createAuctionMsg],
                fee,
                "creating auction using Eliza"
            );
            return tx;
        } catch (e) {
            elizaLogger.error(`Error in creating auction: ${e}`);
            throw e;
        }
    }

    async placeBid(
        auctionId: string,
        denom: string,
        amount: string | number,
    ): Promise<DeliverTxResponse> {
        try {
            const address = await this.wallet.getAddress();
            const client = await this.wallet.getClient();
            if (!address) {
                throw new Error("Could not get address");
            }
            client.registry.register("/OmniFlix.marketplace.v1beta1.MsgPlaceBid", MsgPlaceBid);

            const placeBid = {
                auctionId,
                amount: {
                    denom,
                    amount: amount.toString(),
                },
                bidder: address,
            };
            const placeBidMsg = {
                typeUrl: '/OmniFlix.marketplace.v1beta1.MsgPlaceBid',
                value: placeBid
            };
            console.log(placeBidMsg);
            const fee = {
                amount: [{
                    denom: 'uflix',
                    amount: '50000'
                }],
                gas: '5000000'
            };
            const tx = await client.signAndBroadcast(
                address,
                [placeBidMsg],
                fee,
                "placing bid using Eliza"
            );
            return tx;
        } catch (e) {
            elizaLogger.error(`Error in placing bid: ${e}`);
            throw e;
        }
    }

    async cancelAuction(
        auctionId: string,
    ): Promise<DeliverTxResponse> {
        try {
            const address = await this.wallet.getAddress();
            const client = await this.wallet.getClient();
            if (!address) {
                throw new Error("Could not get address");
            }
            client.registry.register("/OmniFlix.marketplace.v1beta1.MsgCancelAuction", MsgCancelAuction);

            const cancelAuction = {
                auctionId,
                owner: address,
            };
            const cancelAuctionMsg = {
                typeUrl: '/OmniFlix.marketplace.v1beta1.MsgCancelAuction',
                value: cancelAuction
            };
            const fee = {
                amount: [{
                    denom: 'uflix',
                    amount: '50000'
                }],
                gas: '5000000'
            };
            const tx = await client.signAndBroadcast(
                address,
                [cancelAuctionMsg],
                fee,
                "canceling auction using Eliza"
            );
            return tx;
        } catch (e) {
            elizaLogger.error(`Error in canceling auction: ${e}`);
            throw e;
        }
    }

}