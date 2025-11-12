// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {FairFund} from "../src/FairFund.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract FairFundTest is Test {
    FairFund internal fairFund;
    MockERC20 internal token;

    address internal owner = address(0xA11CE);
    address internal feeVault = address(0xFEE);
    address internal creator = address(0xB0B);
    address internal backer = address(0xC0C0);

    uint256 internal constant PLATFORM_FEE_BPS = 500; // 5%
    uint256 internal constant GOAL = 1_000 ether;
    uint256 internal constant DURATION = 3 days;

    function setUp() external {
        fairFund = new FairFund(owner, feeVault, uint16(PLATFORM_FEE_BPS));
        token = new MockERC20("Mock Token", "MOCK", 18);

        token.mint(backer, 10_000 ether);
        token.mint(creator, 10_000 ether);

        vm.prank(owner);
        fairFund.allowToken(address(token), 0);

        vm.prank(backer);
        token.approve(address(fairFund), type(uint256).max);
    }

    function _createDefaultProject() internal returns (uint256 projectId, uint256 createdAt) {
        createdAt = block.timestamp;
        vm.prank(creator);
        projectId = fairFund.createProject(address(token), "Project Alpha", "ipfs://description", GOAL, DURATION);
    }

    function testCreateProjectStoresData() external {
        (uint256 projectId, uint256 createdAt) = _createDefaultProject();

        FairFund.Project memory project = fairFund.getProject(projectId);
        assertEq(project.creator, creator, "creator");
        assertEq(project.tokenAddress, address(token), "token");
        assertEq(project.goal, GOAL, "goal");
        assertEq(project.deadline, createdAt + DURATION, "deadline");
        assertEq(project.totalRaised, 0, "initial raised");
        assertEq(project.cancelled, false, "cancelled");
    }

    function testFundProjectIncreasesBalance() external {
        (uint256 projectId,) = _createDefaultProject();

        vm.prank(backer);
        fairFund.fundProject(projectId, 400 ether);

        FairFund.Project memory project = fairFund.getProject(projectId);
        assertEq(project.totalRaised, 400 ether, "raised amount");

        FairFund.Contribution memory contrib = fairFund.getContribution(projectId, backer);
        assertEq(contrib.amount, 400 ether, "contribution recorded");
        assertEq(token.balanceOf(address(fairFund)), 400 ether, "contract balance");
    }

    function testWithdrawFundsSendsFeeAndPayout() external {
        (uint256 projectId,) = _createDefaultProject();

        vm.prank(backer);
        fairFund.fundProject(projectId, GOAL);

        uint256 contractBalance = token.balanceOf(address(fairFund));
        assertEq(contractBalance, GOAL, "pre-withdraw balance");

        vm.prank(creator);
        fairFund.withdrawFunds(projectId);

        uint256 feeAmount = (GOAL * PLATFORM_FEE_BPS) / 10_000;
        uint256 expectedPayout = GOAL - feeAmount;

        assertEq(token.balanceOf(feeVault), feeAmount, "fee vault");
        assertEq(token.balanceOf(creator), 10_000 ether + expectedPayout, "creator balance");

        FairFund.Project memory project = fairFund.getProject(projectId);
        assertTrue(project.withdrawn, "withdrawn flag");
    }

    function testRefundAfterFailedCampaign() external {
        (uint256 projectId,) = _createDefaultProject();

        vm.prank(backer);
        fairFund.fundProject(projectId, 200 ether);

        vm.warp(block.timestamp + DURATION + 1);

        vm.prank(backer);
        fairFund.refund(projectId);

        FairFund.Contribution memory contrib = fairFund.getContribution(projectId, backer);
        assertEq(contrib.refunded, 200 ether, "refunded amount");
        assertEq(token.balanceOf(backer), 10_000 ether, "backer refunded");
    }

    function testCannotFundAfterDeadline() external {
        (uint256 projectId,) = _createDefaultProject();
        vm.warp(block.timestamp + DURATION + 1);

        FairFund.Project memory project = fairFund.getProject(projectId);
        vm.expectRevert(abi.encodeWithSelector(FairFund.DeadlineReached.selector, project.deadline));
        vm.prank(backer);
        fairFund.fundProject(projectId, 100 ether);
    }

    function testOwnerCanPauseAndUnpause() external {
        vm.prank(owner);
        fairFund.pause();

        vm.expectRevert();
        vm.prank(creator);
        fairFund.createProject(address(token), "Paused", "ipfs://", GOAL, DURATION);

        vm.prank(owner);
        fairFund.unpause();

        vm.prank(creator);
        fairFund.createProject(address(token), "Resumed", "ipfs://", GOAL, DURATION);
    }

    function testCancelProjectBeforeFunding() external {
        (uint256 projectId,) = _createDefaultProject();

        vm.prank(creator);
        fairFund.cancelProject(projectId);

        FairFund.Project memory project = fairFund.getProject(projectId);
        assertTrue(project.cancelled, "cancelled");

        vm.expectRevert(abi.encodeWithSelector(FairFund.ProjectIsCancelled.selector, projectId));
        vm.prank(backer);
        fairFund.fundProject(projectId, 100 ether);
    }
}
