import { bankActions } from "./bank";
import { stakingActions } from "./staking";
import { govActions } from "./gov";
import { onftActions } from "./omniflix/onft";
import { marketPlaceActions } from "./omniflix/marketplace";

export const actions = [
    ...bankActions, 
    ...stakingActions, 
    ...govActions, 
    ...onftActions,
    ...marketPlaceActions,
];

export default actions;
