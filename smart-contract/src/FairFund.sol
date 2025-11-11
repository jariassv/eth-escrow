// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title FairFund - Escrow crowdfunding contract supporting ERC20 tokens
/// @author FairFund
/// @notice Manages creation of fundraising campaigns with escrow-based fund release
/// @dev Built for educational purposes; not audited for production use
contract FairFund is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    uint16 public constant MAX_PLATFORM_FEE_BPS = 1_000; // 10%

    struct TokenConfig {
        bool allowed;
        uint16 feeBpsOverride; // optional per-token override, 0 uses global fee
    }

    struct Project {
        address creator;
        address tokenAddress;
        string title;
        string descriptionURI;
        uint256 goal;
        uint256 deadline;
        uint256 totalRaised;
        uint256 totalRefunded;
        bool withdrawn;
        bool cancelled;
        bool pausedByCreator;
    }

    struct Contribution {
        uint256 amount;
        uint256 refunded;
    }

    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    address public immutable feeVault;
    uint16 public platformFeeBps;
    uint256 public projectCount;

    mapping(uint256 => Project) private projects;
    mapping(uint256 => mapping(address => Contribution)) private contributions;
    mapping(address => TokenConfig) public tokenConfigs;

    // -------- Errors --------
    error TokenAlreadyAllowed(address token);
    error TokenNotAllowed(address token);
    error FeeTooHigh(uint16 feeBps);
    error InvalidGoal(uint256 goal);
    error InvalidDeadline(uint256 deadline, uint256 minDeadline);
    error ProjectNotFound(uint256 id);
    error ProjectNotActive(uint256 id);
    error ProjectIsCancelled(uint256 id);
    error ProjectIsPaused(uint256 id);
    error ProjectAlreadyCompleted(uint256 id);
    error ContributionZero();
    error DeadlineReached(uint256 deadline);
    error GoalNotReached(uint256 raised, uint256 goal);
    error AlreadyWithdrawn(uint256 id);
    error NoContribution(address backer);
    error AlreadyRefunded(address backer, uint256 id);
    error Unauthorized(address caller);
    error PlatformFeeVaultZero();

    // -------- Events --------
    event TokenAllowed(address indexed token, uint16 feeBpsOverride);
    event TokenRemoved(address indexed token);
    event PlatformFeeUpdated(uint16 newFee);
    event ProjectCreated(
        uint256 indexed id, address indexed creator, address indexed token, uint256 goal, uint256 deadline
    );
    event ProjectCancelled(uint256 indexed id);
    event ProjectPaused(uint256 indexed id);
    event ProjectResumed(uint256 indexed id);
    event ContributionAdded(uint256 indexed id, address indexed backer, uint256 amount);
    event FundsWithdrawn(uint256 indexed id, address indexed creator, uint256 amount, uint256 fee);
    event RefundProcessed(uint256 indexed id, address indexed backer, uint256 amount);
    event FeesWithdrawn(address indexed vault, uint256 amount);

    constructor(address initialOwner, address _feeVault, uint16 _platformFeeBps) Ownable(initialOwner) {
        if (_feeVault == address(0)) {
            revert PlatformFeeVaultZero();
        }
        if (_platformFeeBps > MAX_PLATFORM_FEE_BPS) {
            revert FeeTooHigh(_platformFeeBps);
        }
        feeVault = _feeVault;
        platformFeeBps = _platformFeeBps;
    }

    // -------- Modifiers --------

    modifier onlyProjectCreator(uint256 projectId) {
        Project storage project = projects[projectId];
        if (project.creator == address(0)) {
            revert ProjectNotFound(projectId);
        }
        if (project.creator != _msgSender()) {
            revert Unauthorized(_msgSender());
        }
        _;
    }

    modifier projectExists(uint256 projectId) {
        if (projects[projectId].creator == address(0)) {
            revert ProjectNotFound(projectId);
        }
        _;
    }

    // -------- Token management --------

    function allowToken(address token, uint16 feeBpsOverride) external onlyOwner {
        if (token == address(0)) {
            revert TokenNotAllowed(token);
        }
        TokenConfig storage config = tokenConfigs[token];
        if (config.allowed) {
            revert TokenAlreadyAllowed(token);
        }
        if (feeBpsOverride > MAX_PLATFORM_FEE_BPS) {
            revert FeeTooHigh(feeBpsOverride);
        }
        tokenConfigs[token] = TokenConfig({allowed: true, feeBpsOverride: feeBpsOverride});
        emit TokenAllowed(token, feeBpsOverride);
    }

    function removeToken(address token) external onlyOwner {
        TokenConfig storage config = tokenConfigs[token];
        if (!config.allowed) {
            revert TokenNotAllowed(token);
        }
        delete tokenConfigs[token];
        emit TokenRemoved(token);
    }

    function setPlatformFee(uint16 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_PLATFORM_FEE_BPS) {
            revert FeeTooHigh(newFeeBps);
        }
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    // -------- Project management --------

    function createProject(
        address token,
        string calldata title,
        string calldata descriptionURI,
        uint256 goal,
        uint256 duration
    ) external whenNotPaused returns (uint256 projectId) {
        TokenConfig memory config = tokenConfigs[token];
        if (!config.allowed) {
            revert TokenNotAllowed(token);
        }
        if (goal == 0) {
            revert InvalidGoal(goal);
        }
        uint256 minDuration = 1 hours;
        if (duration < minDuration) {
            revert InvalidDeadline(duration, minDuration);
        }

        projectId = ++projectCount;
        uint256 deadline = block.timestamp + duration;
        projects[projectId] = Project({
            creator: _msgSender(),
            tokenAddress: token,
            title: title,
            descriptionURI: descriptionURI,
            goal: goal,
            deadline: deadline,
            totalRaised: 0,
            totalRefunded: 0,
            withdrawn: false,
            cancelled: false,
            pausedByCreator: false
        });

        emit ProjectCreated(projectId, _msgSender(), token, goal, deadline);
    }

    function cancelProject(uint256 projectId) external onlyProjectCreator(projectId) {
        Project storage project = projects[projectId];
        if (project.cancelled) {
            revert ProjectIsCancelled(projectId);
        }
        if (project.totalRaised > 0) {
            revert ProjectAlreadyCompleted(projectId);
        }
        project.cancelled = true;
        emit ProjectCancelled(projectId);
    }

    function toggleProjectPause(uint256 projectId, bool pauseProject) external onlyProjectCreator(projectId) {
        Project storage project = projects[projectId];
        if (project.cancelled) {
            revert ProjectIsCancelled(projectId);
        }
        if (project.withdrawn) {
            revert ProjectAlreadyCompleted(projectId);
        }
        project.pausedByCreator = pauseProject;
        if (pauseProject) {
            emit ProjectPaused(projectId);
        } else {
            emit ProjectResumed(projectId);
        }
    }

    // -------- Funding logic --------

    function fundProject(uint256 projectId, uint256 amount)
        external
        nonReentrant
        whenNotPaused
        projectExists(projectId)
    {
        if (amount == 0) {
            revert ContributionZero();
        }
        Project storage project = projects[projectId];
        if (project.cancelled) {
            revert ProjectIsCancelled(projectId);
        }
        if (project.pausedByCreator) {
            revert ProjectIsPaused(projectId);
        }
        if (block.timestamp >= project.deadline) {
            revert DeadlineReached(project.deadline);
        }
        if (project.totalRaised >= project.goal) {
            revert ProjectAlreadyCompleted(projectId);
        }

        IERC20 token = IERC20(project.tokenAddress);
        token.safeTransferFrom(_msgSender(), address(this), amount);

        Contribution storage contribution = contributions[projectId][_msgSender()];
        contribution.amount += amount;

        project.totalRaised += amount;

        emit ContributionAdded(projectId, _msgSender(), amount);
    }

    function withdrawFunds(uint256 projectId) external nonReentrant onlyProjectCreator(projectId) {
        Project storage project = projects[projectId];
        if (project.cancelled) {
            revert ProjectIsCancelled(projectId);
        }
        if (project.withdrawn) {
            revert AlreadyWithdrawn(projectId);
        }
        if (project.totalRaised < project.goal) {
            revert GoalNotReached(project.totalRaised, project.goal);
        }
        if (block.timestamp < project.deadline) {
            // ensure goal reached before deadline, but allow early withdrawal if goal reached
            // no revert; allow withdraw as soon as goal reached
        }

        uint256 available = project.totalRaised - project.totalRefunded;
        if (available == 0) {
            revert GoalNotReached(project.totalRaised, project.goal);
        }

        project.withdrawn = true;

        uint16 feeBps = tokenConfigs[project.tokenAddress].feeBpsOverride;
        if (feeBps == 0) {
            feeBps = platformFeeBps;
        }
        uint256 feeAmount = (available * feeBps) / 10_000;
        uint256 payout = available - feeAmount;

        IERC20 token = IERC20(project.tokenAddress);
        if (feeAmount > 0) {
            token.safeTransfer(feeVault, feeAmount);
            emit FeesWithdrawn(feeVault, feeAmount);
        }
        token.safeTransfer(project.creator, payout);

        emit FundsWithdrawn(projectId, project.creator, payout, feeAmount);
    }

    function refund(uint256 projectId) external nonReentrant projectExists(projectId) {
        Project storage project = projects[projectId];
        if (project.withdrawn) {
            revert ProjectAlreadyCompleted(projectId);
        }

        Contribution storage contribution = contributions[projectId][_msgSender()];
        uint256 contributed = contribution.amount;
        if (contributed == 0) {
            revert NoContribution(_msgSender());
        }
        if (contribution.refunded > 0) {
            revert AlreadyRefunded(_msgSender(), projectId);
        }

        bool isFailed = block.timestamp >= project.deadline && project.totalRaised < project.goal;
        bool isCancelled = project.cancelled;
        if (!isFailed && !isCancelled) {
            revert ProjectNotActive(projectId);
        }

        contribution.refunded = contributed;
        project.totalRefunded += contributed;

        IERC20(project.tokenAddress).safeTransfer(_msgSender(), contributed);

        emit RefundProcessed(projectId, _msgSender(), contributed);
    }

    // -------- Owner controls --------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // -------- View functions --------

    function getProject(uint256 projectId) external view projectExists(projectId) returns (Project memory) {
        return projects[projectId];
    }

    function getContribution(uint256 projectId, address backer)
        external
        view
        projectExists(projectId)
        returns (Contribution memory)
    {
        return contributions[projectId][backer];
    }

    function getProjects(uint256 offset, uint256 limit) external view returns (Project[] memory results) {
        if (offset >= projectCount || limit == 0) {
            return new Project[](0);
        }
        uint256 end = offset + limit;
        if (end > projectCount) {
            end = projectCount;
        }
        uint256 size = end - offset;
        results = new Project[](size);
        uint256 index;
        for (uint256 i = offset; i < end; i++) {
            results[index] = projects[i + 1]; // project ids are 1-based
            index++;
        }
    }

    function computeClaimable(uint256 projectId) external view projectExists(projectId) returns (uint256) {
        Project storage project = projects[projectId];
        if (project.totalRaised < project.goal) {
            return 0;
        }
        uint256 available = project.totalRaised - project.totalRefunded;
        uint16 feeBps = tokenConfigs[project.tokenAddress].feeBpsOverride;
        if (feeBps == 0) {
            feeBps = platformFeeBps;
        }
        uint256 feeAmount = (available * feeBps) / 10_000;
        return available - feeAmount;
    }
}
