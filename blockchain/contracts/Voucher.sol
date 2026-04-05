// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title  Voucher
 * @author ChainLoyalty
 * @notice Gasless Coffee Voucher system.
 * 
 * Architecture notes
 * ──────────────────
 * • The backend hot wallet holds the MINTER_ROLE and pays gas for users.
 * • Soulbound: Non-transferable once minted, as these are individual rewards.
 */
contract Voucher is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;

    event VoucherMinted(address indexed recipient, uint256 indexed tokenId, string uri);

    constructor() ERC721("BrewboundVoucher", "BREW") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @notice Mint a new coffee voucher NFT.
     * @dev Only callable by the backend (MINTER_ROLE).
     */
    function mintVoucher(address recipient, string memory uri) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit VoucherMinted(recipient, tokenId, uri);
        return tokenId;
    }

    /**
     * @dev Override to enforce Soulbound (non-transferable) behavior.
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Voucher: Non-transferable (Soulbound)");
        }
        return super._update(to, tokenId, auth);
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
