// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {FairFund} from "../src/FairFund.sol";

contract DeployFairFund is Script {
    function run() external returns (FairFund deployed) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY_DEPLOYER");
        address owner = vm.envAddress("FAIRFUND_OWNER");
        address feeVault = vm.envAddress("FAIRFUND_FEE_VAULT");
        uint16 platformFeeBps = uint16(vm.envUint("FAIRFUND_PLATFORM_FEE_BPS"));

        vm.startBroadcast(deployerKey);
        deployed = new FairFund(owner, feeVault, platformFeeBps);
        vm.stopBroadcast();

        console.log("FairFund deployed at:", address(deployed));
        return deployed;
    }
}
