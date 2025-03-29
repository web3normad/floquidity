// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Floquidity is Ownable {
    struct UserRiskProfile {
        uint8 riskTolerance;
        uint8 riskLevel;
        uint64 lastRiskAssessment;
        uint256 maxRiskExposure;
    }

    struct AIStrategy {
        bytes32 id;
        uint256 apy;
        string name;
        string platform;
        string chain;
        uint8 riskLevel;
        uint8 aiConfidence;
        bool isActive;
    }

    uint256 private constant MAX_RISK_TOLERANCE = 10;
    uint256 private constant RISK_MULTIPLIER = 1000;

    mapping(address => UserRiskProfile) private _userRiskProfiles;
    mapping(bytes32 => AIStrategy) private _registeredStrategies;
    mapping(address => bytes32[]) private _userStrategies;
    mapping(address => uint256) private _userBalances;

    constructor() Ownable(msg.sender) {}

    function registerStrategy(
        bytes32 _id,
        string memory _name,
        string memory _platform,
        string memory _chain,
        uint256 _apy,
        uint8 _riskLevel,
        uint8 _aiConfidence
    ) external onlyOwner {
        require(_riskLevel > 0 && _riskLevel <= 3, "Invalid risk level");

        _registeredStrategies[_id] = AIStrategy({
            id: _id,
            name: _name,
            platform: _platform,
            chain: _chain,
            apy: _apy,
            riskLevel: _riskLevel,
            aiConfidence: _aiConfidence,
            isActive: true
        });

        emit StrategyRegistered(_id, _name, _riskLevel);
    }

    function setUserRiskProfile(uint8 _riskTolerance, uint256 _maxRiskExposure) external {
        require(_riskTolerance >= 1 && _riskTolerance <= MAX_RISK_TOLERANCE, "Risk tolerance must be between 1-10");

        _userRiskProfiles[msg.sender] = UserRiskProfile({
            riskTolerance: _riskTolerance,
            riskLevel: _riskTolerance > 7 ? 3 : (_riskTolerance > 3 ? 2 : 1),
            maxRiskExposure: _maxRiskExposure,
            lastRiskAssessment: uint64(block.timestamp)
        });

        emit RiskProfileUpdated(msg.sender, _riskTolerance, _maxRiskExposure);
    }

    function executeStrategy(bytes32 strategyId, uint256 amount) external returns (bool success) {
        UserRiskProfile memory userRisk = _userRiskProfiles[msg.sender];
        AIStrategy memory strategy = _registeredStrategies[strategyId];

        require(strategy.isActive, "Strategy not active");
        require(_userBalances[msg.sender] >= amount, "Insufficient balance");

        bool isRiskAcceptable =
            _validateStrategyRisk(userRisk.riskTolerance, strategy.riskLevel, amount, userRisk.maxRiskExposure);
        require(isRiskAcceptable, "Strategy risk exceeds tolerance");

        unchecked {
            _userBalances[msg.sender] -= amount;
        }
        _userStrategies[msg.sender].push(strategyId);

        emit StrategyExecuted(msg.sender, strategyId, amount);
        return true;
    }

    function _validateStrategyRisk(
        uint8 userRiskTolerance,
        uint8 strategyRiskLevel,
        uint256 amount,
        uint256 maxRiskExposure
    ) private pure returns (bool) {
        uint8 riskMultiplier = strategyRiskLevel == 1 ? 2 : strategyRiskLevel == 2 ? 5 : 8;

        uint256 riskScore = amount * riskMultiplier;

        if (userRiskTolerance <= 3 && strategyRiskLevel == 3) return false;
        if (riskScore > maxRiskExposure) return false;

        return riskScore <= (userRiskTolerance * RISK_MULTIPLIER);
    }

    function toggleStrategyStatus(bytes32 strategyId, bool status) external onlyOwner {
        _registeredStrategies[strategyId].isActive = status;
        emit StrategyStatusChanged(strategyId, status);
    }

    function getUserStrategies(address user) external view returns (bytes32[] memory) {
        return _userStrategies[user];
    }

    function depositBalance(uint256 amount) external {
        unchecked {
            _userBalances[msg.sender] += amount;
        }
        emit BalanceDeposited(msg.sender, amount);
    }

    event StrategyRegistered(bytes32 indexed strategyId, string name, uint8 riskLevel);

    event RiskProfileUpdated(address indexed user, uint8 riskTolerance, uint256 maxRiskExposure);

    event StrategyExecuted(address indexed user, bytes32 indexed strategyId, uint256 amount);

    event BalanceDeposited(address indexed user, uint256 amount);

    event StrategyStatusChanged(bytes32 indexed strategyId, bool status);
}
