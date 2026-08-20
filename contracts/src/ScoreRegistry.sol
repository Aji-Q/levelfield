// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ScoreRegistry
/// @notice On-chain registry of LevelField structural information-asymmetry risk scores for
///         Somnia Shannon testnet (chain id 50312) event contracts. Scores are published here as
///         a public good: any contract or autonomous agent can read a market's risk attestation
///         directly from chain state, without trusting an off-chain API or levelfield's own
///         availability. See packages/scoring for the deterministic pipeline that produces them.
/// @dev Hand-rolled two-slot owner pattern (owner + pendingOwner, two-step transfer) instead of
///      an OpenZeppelin dependency. Two-step transfer exists because a plain one-step
///      `transferOwnership` bricks the registry forever if the new address is mistyped or can't
///      sign; nothing else here is configurable — no upgradability, no governance, no token.
contract ScoreRegistry {
    /// @notice A single published risk attestation for one market.
    /// @param score 0-100 overall structural risk score (weighted sum of the five dimensions).
    /// @param band Risk band the score falls into: 0 = low, 1 = moderate, 2 = elevated, 3 = high.
    /// @param dims Effective level (1-5) of each anchor dimension, in fixed order
    ///        [D1 Outcome Control, D2 Knowledge Circle, D3 Insider Tradability,
    ///         D4 Disclosure Synchronicity, D5 Outcome Manufacturability] — see
    ///         data/anchors/anchors.yaml for what each level means.
    /// @param methodHash sha256(anchorLibraryVersion + "|" + promptVersion): binds this
    ///        attestation to the exact anchor-library and classification-prompt versions that
    ///        produced it, so a later methodology revision can never be misread onto old scores.
    /// @param scoredAt Unix timestamp (seconds) the score was computed off-chain.
    /// @param uri Location of the full ScoreResult JSON (evidence quotes, per-dimension
    ///        reasoning, caveats) this attestation summarizes.
    struct Attestation {
        uint8 score;
        uint8 band;
        uint8[5] dims;
        bytes32 methodHash;
        uint64 scoredAt;
        string uri;
    }

    /// @notice Current owner, the only address allowed to publish attestations.
    address public owner;
    /// @notice Address nominated by the current owner; has no power until it calls
    ///         acceptOwnership itself (step 2 of the two-step transfer).
    address public pendingOwner;

    /// @dev keccak256(bytes(marketId)) -> attestation. Not `public`: exposed only through the
    ///      explicit `get` below so the ABI matches the spec exactly (no auto-generated getter
    ///      quirks around the fixed-size `dims` array).
    mapping(bytes32 => Attestation) attestations;

    /// @notice Emitted whenever an attestation is published or overwritten.
    /// @param key keccak256(bytes(marketId)) — the registry's lookup key for the market.
    event ScorePublished(bytes32 indexed key, uint8 score, uint8 band, bytes32 methodHash);
    event OwnershipTransferStarted(address indexed previousOwner, address indexed newPendingOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    error NotOwner();
    error NotPendingOwner();
    error LengthMismatch();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Publish (or overwrite) one attestation.
    /// @param key keccak256(bytes(marketId)) for the market this attestation describes.
    function publish(bytes32 key, Attestation calldata a) external onlyOwner {
        attestations[key] = a;
        emit ScorePublished(key, a.score, a.band, a.methodHash);
    }

    /// @notice Publish many attestations in one transaction; reverts as a whole on any failure,
    ///         so a batch never leaves a partially-published set of scores on chain.
    function publishBatch(bytes32[] calldata keys, Attestation[] calldata items) external onlyOwner {
        if (keys.length != items.length) revert LengthMismatch();
        for (uint256 i = 0; i < keys.length; i++) {
            attestations[keys[i]] = items[i];
            emit ScorePublished(keys[i], items[i].score, items[i].band, items[i].methodHash);
        }
    }

    /// @notice Read one attestation. Returns a zero-valued struct if none was ever published.
    function get(bytes32 key) external view returns (Attestation memory) {
        return attestations[key];
    }

    /// @notice Step 1: nominate a new owner. Ownership does not move until the nominee calls
    ///         acceptOwnership.
    function transferOwnership(address newOwner) external onlyOwner {
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Step 2: the nominated address claims ownership.
    function acceptOwnership() external {
        if (msg.sender != pendingOwner) revert NotPendingOwner();
        emit OwnershipTransferred(owner, msg.sender);
        owner = msg.sender;
        pendingOwner = address(0);
    }
}
