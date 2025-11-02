// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title EtharisEscrow
 * @author Etharis Team
 * @dev Escrow contract for sponsorship deals. All action functions can only be called by the Server Wallet (Owner).
 * @notice Uses IDRX as the payment token (Indonesian Rupiah stablecoin).
 */
contract EtharisEscrow is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;

    // ============ CUSTOM ERRORS (Gas Optimization) ============
    error DealAlreadyExists();
    error InvalidAddress();
    error CreatorCannotBeBrand();
    error AmountMustBeGreaterThanZero();
    error DeadlineMustBeInFuture();
    error BriefHashRequired();
    error DealNotFound();
    error InvalidDealStatus();
    error NotAuthorized();
    error DealAlreadyFunded();
    error InsufficientBalance();
    error InsufficientAllowance();
    error DealNotFunded();
    error SubmissionDeadlinePassed();
    error ContentUrlRequired();
    error ReviewPeriodNotEnded();
    error ReviewPeriodEnded();
    error ReasonRequired();
    error DeadlineNotPassed();
    error CannotCancelThisDeal();
    error FeeTooHigh();
    error CannotWithdrawIDRX();
    error InvalidDealID();
    error InvalidAmount();
    error PermitFailed();

    // ============ STATE VARIABLES ============
    IERC20 private immutable _idrxToken;
    uint96 private _platformFeeBps = 250; // 2.5%
    uint96 private constant BPS_DENOMINATOR = 10000;
    uint64 private constant REVIEW_PERIOD = 72 hours;
    address private _feeRecipient;

    bytes32 public constant SERVER_ROLE = keccak256("SERVER_ROLE");

    enum ContractStatus {
        PENDING,
        ACTIVE,
        PENDING_REVIEW,
        DISPUTED,
        COMPLETED,
        CANCELLED
    }

    struct Deal {
        address brand;
        address creator;
        string dealId;
        string briefHash;
        string contentUrl;
        string disputeReason;
        uint96 amount;
        uint64 deadline;
        uint64 fundedAt;
        uint64 submittedAt;
        uint64 reviewDeadline;
        uint64 disputedAt;
        uint64 createdAt;
        ContractStatus status;
        bool acceptedDispute;
        bool exists;
    }

    mapping(string dealId => Deal dealData) private _deals;
    mapping(address user => string[] dealIds) private _brandDeals;
    mapping(address user => string[] dealIds) private _creatorDeals;

    // ============ EVENTS ============
    event DealCreated(
        string indexed dealId,
        address indexed brand,
        address indexed creator,
        uint96 amount,
        uint64 deadline
    );
    event DealFunded(
        string indexed dealId,
        address indexed brand,
        uint96 amount
    );
    event ContentSubmitted(
        string indexed dealId,
        address indexed creator,
        string contentUrl,
        uint64 reviewDeadline
    );
    event DealApproved(string indexed dealId, address indexed brand);
    event PaymentReleased(
        string indexed dealId,
        address indexed creator,
        uint96 amount,
        uint96 platformFee
    );
    event DisputeInitiated(
        string indexed dealId,
        address indexed brand,
        string reason
    );
    event DisputeResolved(
        string indexed dealId,
        address indexed creator,
        bool acceptedDispute,
        uint96 creatorAmount,
        uint96 brandRefund
    );
    event DealCancelled(
        string indexed dealId,
        address indexed initiator,
        uint96 refundAmount
    );
    event PlatformFeeUpdated(uint96 oldFee, uint96 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);

    // ============ MODIFIERS ============
    modifier onlyDealBrand(string memory _dealId, address _brand) {
        if (_deals[_dealId].brand != _brand) revert NotAuthorized();
        _;
    }

    modifier onlyDealCreator(string memory _dealId, address _creator) {
        if (_deals[_dealId].creator != _creator) revert NotAuthorized();
        _;
    }

    modifier dealExists(string memory _dealId) {
        if (!_deals[_dealId].exists) revert DealNotFound();
        _;
    }

    modifier inStatus(string memory _dealId, ContractStatus _status) {
        if (_deals[_dealId].status != _status) revert InvalidDealStatus();
        _;
    }

    // ============ CONSTRUCTOR ============
    constructor(
        address idrxToken_,
        address feeRecipient_,
        address initialOwner_
    ) payable {
        if (idrxToken_ == address(0)) revert InvalidAddress();
        if (feeRecipient_ == address(0)) revert InvalidAddress();
        if (initialOwner_ == address(0)) revert InvalidAddress();

        _idrxToken = IERC20(idrxToken_);
        _feeRecipient = feeRecipient_;

        _grantRole(SERVER_ROLE, initialOwner_);
        _setRoleAdmin(SERVER_ROLE, SERVER_ROLE);
    }

    // =================================================================
    // CUSTODIAL USER ACTIONS (Called by the Server Wallet)
    // =================================================================

    /**
     * @notice [CUSTODIAL] Brand creates a new deal.
     * @dev Only SERVER_ROLE can call this function
     */
    function createDeal(
        string memory _dealId,
        address _brandAddress,
        address _creatorAddress,
        uint96 _amount,
        uint64 _deadline,
        string memory _briefHash
    ) external onlyRole(SERVER_ROLE) whenNotPaused {
        if (_deals[_dealId].exists) revert DealAlreadyExists();
        if (_creatorAddress == address(0)) revert InvalidAddress();
        if (_brandAddress == address(0)) revert InvalidAddress();
        if (_brandAddress == _creatorAddress) revert CreatorCannotBeBrand();
        if (_amount == 0) revert AmountMustBeGreaterThanZero();
        if (_deadline <= block.timestamp) revert DeadlineMustBeInFuture();
        if (bytes(_briefHash).length == 0) revert BriefHashRequired();

        // Assign struct fields individually for better gas efficiency
        Deal storage deal = _deals[_dealId];
        deal.dealId = _dealId;
        deal.brand = _brandAddress;
        deal.creator = _creatorAddress;
        deal.amount = _amount;
        deal.deadline = _deadline;
        deal.briefHash = _briefHash;
        deal.status = ContractStatus.PENDING;
        deal.createdAt = uint64(block.timestamp);
        deal.contentUrl = "";
        deal.exists = true;
        // fundedAt, submittedAt, reviewDeadline default to 0

        _brandDeals[_brandAddress].push(_dealId);
        _creatorDeals[_creatorAddress].push(_dealId);

        emit DealCreated(
            _dealId,
            _brandAddress,
            _creatorAddress,
            _amount,
            _deadline
        );
    }

    /**
     * @notice [CUSTODIAL] Brand fund deal with gasless permit support
     * @dev Brands sign permit off-chain, server executes with signature for gasless transaction
     */
    function fundDeal(
        string memory _dealId,
        address _brandAddress,
        uint96 _amount,
        uint256 _deadline,
        uint8 _v,
        bytes32 _r,
        bytes32 _s
    )
        external
        nonReentrant
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        onlyDealBrand(_dealId, _brandAddress)
        inStatus(_dealId, ContractStatus.PENDING)
    {
        if (bytes(_dealId).length == 0) revert InvalidDealID();
        if (_amount == 0) revert InvalidAmount();

        Deal storage deal = _deals[_dealId];

        if (deal.fundedAt != 0) revert DealAlreadyFunded();

        // Cache address(this) to save gas
        address cachedThis = address(this);
        IERC20 token = _idrxToken;

        uint256 brandBalance = token.balanceOf(_brandAddress);
        if (brandBalance < _amount) revert InsufficientBalance();

        // Safe Permit: Only execute if signature is provided
        if (_v != 0 || _r != bytes32(0) || _s != bytes32(0)) {
            _executePermit(
                _brandAddress,
                cachedThis,
                _amount,
                _deadline,
                _v,
                _r,
                _s
            );
        }

        uint256 allowance = token.allowance(_brandAddress, cachedThis);
        if (allowance < _amount) revert InsufficientAllowance();

        token.safeTransferFrom(_brandAddress, cachedThis, _amount);

        deal.fundedAt = uint64(block.timestamp);

        emit DealFunded(_dealId, _brandAddress, _amount);
    }

    /**
     * @notice [CUSTODIAL] Creator accepts the funded deal
     */
    function acceptDeal(
        string memory _dealId,
        address _creatorAddress
    )
        external
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        onlyDealCreator(_dealId, _creatorAddress)
        inStatus(_dealId, ContractStatus.PENDING)
    {
        Deal storage deal = _deals[_dealId];

        if (deal.fundedAt == 0) revert DealNotFunded();

        deal.status = ContractStatus.ACTIVE;

        emit DealApproved(_dealId, _creatorAddress);
    }

    /**
     * @notice [CUSTODIAL] Creator submits the content.
     */
    function submitContent(
        string memory _dealId,
        address _creatorAddress,
        string memory _contentUrl
    )
        external
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        onlyDealCreator(_dealId, _creatorAddress)
        inStatus(_dealId, ContractStatus.ACTIVE)
    {
        Deal storage deal = _deals[_dealId];

        if (block.timestamp > deal.deadline) revert SubmissionDeadlinePassed();
        if (bytes(_contentUrl).length == 0) revert ContentUrlRequired();

        deal.status = ContractStatus.PENDING_REVIEW;
        deal.submittedAt = uint64(block.timestamp);
        deal.reviewDeadline = uint64(block.timestamp + REVIEW_PERIOD);
        deal.contentUrl = _contentUrl;

        emit ContentSubmitted(
            _dealId,
            _creatorAddress,
            _contentUrl,
            deal.reviewDeadline
        );
    }

    /**
     * @notice [CUSTODIAL] Brand approve content & release payment.
     */
    function approveDeal(
        string memory _dealId,
        address _brandAddress
    )
        external
        nonReentrant
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        onlyDealBrand(_dealId, _brandAddress)
        inStatus(_dealId, ContractStatus.PENDING_REVIEW)
    {
        Deal storage deal = _deals[_dealId];

        // Inline _releasePayment for gas savings (avoid extra function call)
        uint96 platformFee = (deal.amount * _platformFeeBps) / BPS_DENOMINATOR;
        uint96 creatorAmount = deal.amount - platformFee;

        deal.status = ContractStatus.COMPLETED;

        emit DealApproved(_dealId, _brandAddress);

        IERC20 token = _idrxToken;
        if (creatorAmount != 0) {
            token.safeTransfer(deal.creator, creatorAmount);
        }

        if (platformFee != 0) {
            token.safeTransfer(_feeRecipient, platformFee);
        }

        emit PaymentReleased(_dealId, deal.creator, creatorAmount, platformFee);
    }

    /**
     * @notice Auto-release payment after review period
     */
    function autoReleasePayment(
        string memory _dealId
    )
        external
        nonReentrant
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        inStatus(_dealId, ContractStatus.PENDING_REVIEW)
    {
        Deal storage deal = _deals[_dealId];
        if (block.timestamp < deal.reviewDeadline)
            revert ReviewPeriodNotEnded();

        // Inline _releasePayment for gas savings
        uint96 platformFee = (deal.amount * _platformFeeBps) / BPS_DENOMINATOR;
        uint96 creatorAmount = deal.amount - platformFee;

        deal.status = ContractStatus.COMPLETED;

        IERC20 token = _idrxToken;
        if (creatorAmount != 0) {
            token.safeTransfer(deal.creator, creatorAmount);
        }

        if (platformFee != 0) {
            token.safeTransfer(_feeRecipient, platformFee);
        }

        emit PaymentReleased(_dealId, deal.creator, creatorAmount, platformFee);
    }

    /**
     * @notice [CUSTODIAL] Brand initiate dispute.
     */
    function initiateDispute(
        string memory _dealId,
        address _brandAddress,
        string memory _reason
    )
        external
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        onlyDealBrand(_dealId, _brandAddress)
        inStatus(_dealId, ContractStatus.PENDING_REVIEW)
    {
        Deal storage deal = _deals[_dealId];
        if (block.timestamp >= deal.reviewDeadline) revert ReviewPeriodEnded();
        if (bytes(_reason).length == 0) revert ReasonRequired();

        deal.status = ContractStatus.DISPUTED;
        deal.disputeReason = _reason;
        deal.disputedAt = uint64(block.timestamp);

        emit DisputeInitiated(_dealId, _brandAddress, _reason);
    }

    /**
     * @notice [CUSTODIAL] Creator resolve dispute.
     */
    function resolveDispute(
        string memory _dealId,
        address _creatorAddress,
        bool _acceptDispute
    )
        external
        nonReentrant
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        onlyDealCreator(_dealId, _creatorAddress)
        inStatus(_dealId, ContractStatus.DISPUTED)
    {
        Deal storage deal = _deals[_dealId];

        // Cache storage variables
        uint96 totalEscrow = deal.amount;
        address creator = deal.creator;
        address brand = deal.brand;
        address feeRecip = _feeRecipient;
        uint96 feeBps = _platformFeeBps;

        deal.status = ContractStatus.COMPLETED;
        deal.acceptedDispute = _acceptDispute;

        uint96 creatorAmount;
        uint96 brandRefund;
        uint96 platformFee;

        IERC20 token = _idrxToken;

        if (_acceptDispute) {
            uint96 grossPayout = (totalEscrow * 5000) / BPS_DENOMINATOR; // 50%
            brandRefund = totalEscrow - grossPayout;

            platformFee = (grossPayout * feeBps) / BPS_DENOMINATOR;
            uint96 creatorNet = grossPayout - platformFee;

            creatorAmount = creatorNet;

            if (creatorNet != 0) token.safeTransfer(creator, creatorNet);
            if (brandRefund != 0) token.safeTransfer(brand, brandRefund);
            if (platformFee != 0) token.safeTransfer(feeRecip, platformFee);
        } else {
            creatorAmount = 0;
            brandRefund = totalEscrow;
            platformFee = 0;

            if (brandRefund != 0) token.safeTransfer(brand, brandRefund);
        }

        emit DisputeResolved(
            _dealId,
            _creatorAddress,
            _acceptDispute,
            creatorAmount,
            brandRefund
        );
        emit PaymentReleased(_dealId, creator, creatorAmount, platformFee);
    }

    /**
     * @notice Triggers a full refund to the Brand if the Creator fails to submit content before the deadline.
     */
    function autoRefundAfterDeadline(
        string memory _dealId
    )
        external
        nonReentrant
        onlyRole(SERVER_ROLE)
        whenNotPaused
        dealExists(_dealId)
        inStatus(_dealId, ContractStatus.ACTIVE)
    {
        Deal storage deal = _deals[_dealId];

        if (block.timestamp <= deal.deadline) revert DeadlineNotPassed();

        uint96 refundAmount = deal.amount;

        deal.status = ContractStatus.CANCELLED;

        if (refundAmount != 0) {
            _idrxToken.safeTransfer(deal.brand, refundAmount);
        }

        emit DealCancelled(_dealId, msg.sender, refundAmount);
    }

    /**
     * @notice [CUSTODIAL] Cancel the deal before it is funded.
     */
    function cancelDeal(
        string memory _dealId,
        address _brandAddress
    )
        external
        onlyRole(SERVER_ROLE)
        dealExists(_dealId)
        onlyDealBrand(_dealId, _brandAddress)
        inStatus(_dealId, ContractStatus.PENDING)
    {
        _deals[_dealId].status = ContractStatus.CANCELLED;

        emit DealCancelled(_dealId, _brandAddress, 0);
    }

    /**
     * @notice Emergency cancel deal (SERVER_ROLE only).
     */
    function emergencyCancelDeal(
        string memory _dealId
    ) external nonReentrant onlyRole(SERVER_ROLE) dealExists(_dealId) {
        Deal storage deal = _deals[_dealId];

        // Nested if for gas optimization (short-circuit evaluation)
        if (deal.status != ContractStatus.ACTIVE) {
            if (deal.status != ContractStatus.PENDING_REVIEW) {
                revert CannotCancelThisDeal();
            }
        }

        uint96 refundAmount = deal.amount;
        deal.status = ContractStatus.CANCELLED;

        if (refundAmount != 0) {
            _idrxToken.safeTransfer(deal.brand, refundAmount);
        }

        emit DealCancelled(_dealId, msg.sender, refundAmount);
    }

    // =================================================================
    // VIEW FUNCTIONS (GETTERS)
    // =================================================================

    function idrxToken() external view returns (address) {
        return address(_idrxToken);
    }

    function platformFeeBps() external view returns (uint96) {
        return _platformFeeBps;
    }

    function feeRecipient() external view returns (address) {
        return _feeRecipient;
    }

    function deals(string memory _dealId) external view returns (Deal memory) {
        return _deals[_dealId];
    }

    function brandDeals(
        address _brand
    ) external view returns (string[] memory) {
        return _brandDeals[_brand];
    }

    function creatorDeals(
        address _creator
    ) external view returns (string[] memory) {
        return _creatorDeals[_creator];
    }

    function getDeal(
        string memory _dealId
    )
        external
        view
        returns (
            string memory dealId,
            address brand,
            address creator,
            uint96 amount,
            uint64 deadline,
            ContractStatus status,
            string memory briefHash,
            string memory contentUrl,
            string memory disputeReason,
            uint64 reviewDeadline,
            uint64 fundedAt,
            uint64 submittedAt,
            uint64 disputedAt,
            uint64 createdAt,
            bool acceptedDispute,
            bool exists
        )
    {
        Deal storage deal = _deals[_dealId];
        if (!deal.exists) revert DealNotFound();

        return (
            deal.dealId,
            deal.brand,
            deal.creator,
            deal.amount,
            deal.deadline,
            deal.status,
            deal.briefHash,
            deal.contentUrl,
            deal.disputeReason,
            deal.reviewDeadline,
            deal.fundedAt,
            deal.submittedAt,
            deal.disputedAt,
            deal.createdAt,
            deal.acceptedDispute,
            deal.exists
        );
    }

    function getDeals(
        address _userAddress,
        bool _isBrand
    ) external view returns (string[] memory) {
        return
            _isBrand ? _brandDeals[_userAddress] : _creatorDeals[_userAddress];
    }

    function canAutoRelease(
        string memory _dealId
    ) external view returns (bool) {
        Deal storage deal = _deals[_dealId];
        return
            deal.exists &&
            deal.status == ContractStatus.PENDING_REVIEW &&
            block.timestamp >= deal.reviewDeadline;
    }

    // =================================================================
    // ADMIN FUNCTIONS
    // =================================================================

    function updatePlatformFee(
        uint96 _newFeeBps
    ) external onlyRole(SERVER_ROLE) {
        if (_newFeeBps > 1000) revert FeeTooHigh();

        uint96 oldFee = _platformFeeBps;
        if (oldFee == _newFeeBps) return;

        _platformFeeBps = _newFeeBps;

        emit PlatformFeeUpdated(oldFee, _newFeeBps);
    }

    function updateFeeRecipient(
        address _newRecipient
    ) external onlyRole(SERVER_ROLE) {
        if (_newRecipient == address(0)) revert InvalidAddress();

        address oldRecipient = _feeRecipient;
        if (oldRecipient == _newRecipient) return;

        _feeRecipient = _newRecipient;

        emit FeeRecipientUpdated(oldRecipient, _newRecipient);
    }

    function pause() external onlyRole(SERVER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(SERVER_ROLE) {
        _unpause();
    }

    function emergencyWithdraw(
        address _token,
        uint256 _amount
    ) external onlyRole(SERVER_ROLE) {
        if (_token == address(_idrxToken)) revert CannotWithdrawIDRX();
        if (_amount == 0) revert InvalidAmount();
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }

    // ============ INTERNAL FUNCTIONS ============

    /**
     * @dev Internal function to perform a safe permit with proper error handling.
     */
    function _executePermit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal {
        IERC20Permit token = IERC20Permit(address(_idrxToken));

        try token.permit(owner, spender, value, deadline, v, r, s) {
            // Verify allowance was actually granted
            uint256 allowance = _idrxToken.allowance(owner, spender);
            if (allowance < value) revert InsufficientAllowance();
        } catch {
            revert PermitFailed();
        }
    }
}
