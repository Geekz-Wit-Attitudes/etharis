// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol"; // Fixed: use stable extension, not draft
import "@openzeppelin/contracts/access/Ownable2Step.sol"; // Safer ownership transfer

/**
 * @title MockIDRX
 * @author Etharis
 * @notice Mock implementation of IDRX (Indonesian Rupiah X) token for Base Sepolia testing.
 * @dev This contract simulates custodial top-ups and developer faucet functionality.
 * Uses Ownable2Step for safer access control.
 */
contract MockIDRX is ERC20, ERC20Permit, Ownable2Step {
    uint8 private constant _DECIMALS = 18;

    /// @notice Emitted when custodial top-up is performed.
    /// @param to Recipient wallet of the top-up.
    /// @param amount Amount of IDRX minted.
    event MockPayment(address indexed to, uint256 amount);

    /// @notice Emitted when faucet tokens are minted.
    /// @param receiver Address receiving the faucet tokens.
    /// @param amount Amount of tokens minted from faucet.
    event FaucetClaim(address indexed receiver, uint256 amount);

    /// @notice Emitted when owner mints new tokens.
    /// @param to Recipient of the minted tokens.
    /// @param amount Amount of tokens minted.
    event OwnerMint(address indexed to, uint256 amount);

    /**
     * @notice Deploys the Mock IDRX token.
     * @dev Mints 1 billion IDRX to the initial owner for test liquidity.
     * @param initialOwner The address that will own the contract and receive the initial supply.
     */
    constructor(
        address initialOwner
    )
        ERC20("Indonesian Rupiah X", "IDRX")
        ERC20Permit("Indonesian Rupiah X")
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "Invalid owner address"); // Zero-address check
        _mint(initialOwner, 1_000_000_000 * 10 ** _DECIMALS);
    }

    /// @inheritdoc ERC20
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }

    /**
     * @notice [CUSTODIAL PAYMENT] Mints IDRX to a custodial user wallet.
     * @dev Only callable by the owner (Server Wallet).
     * Emits a {MockPayment} event.
     * @param _to Address of the custodial wallet receiving IDRX.
     * @param _amount Amount of IDRX to mint (18 decimals).
     */
    function mockPayment(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid recipient address"); // Zero-address validation
        require(_amount > 0, "Amount must be non-zero");
        _mint(_to, _amount);
        emit MockPayment(_to, _amount); // Added event
    }

    /**
     * @notice Faucet: mints 1,000,000 IDRX for developer testing.
     * @dev Callable by anyone. Emits a {FaucetClaim} event.
     */
    function faucet() external {
        uint256 faucetAmount = 1_000_000 * 10 ** _DECIMALS;
        _mint(msg.sender, faucetAmount);
        emit FaucetClaim(msg.sender, faucetAmount); // Added event
    }

    /**
     * @notice Mints tokens manually (only by owner).
     * @dev Emits a {OwnerMint} event.
     * @param to Address to receive minted tokens.
     * @param amount Amount of tokens to mint.
     */
    function ownerMint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient address"); // Zero-address validation
        _mint(to, amount);
        emit OwnerMint(to, amount); // Added event
    }
}
