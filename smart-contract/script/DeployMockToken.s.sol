// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../test/mocks/MockERC20.sol";

contract DeployMockToken is Script {
    function run(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        address recipient
    ) external returns (address deployed) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY_DEPLOYER");
        address owner = vm.envAddress("FAIRFUND_OWNER");
        address mintRecipient = recipient == address(0) ? owner : recipient;

        vm.startBroadcast(deployerKey);
        MockERC20 token = new MockERC20(name_, symbol_, decimals_);
        if (initialSupply > 0) {
            token.mint(mintRecipient, initialSupply);
        }
        vm.stopBroadcast();

        console.log("Mock token deployed at:", address(token));
        return address(token);
    }
}

