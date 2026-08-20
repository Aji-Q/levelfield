// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ScoreRegistry} from "../src/ScoreRegistry.sol";

/// @dev Minimal hand-rolled slice of Forge's cheatcode interface — just the two calls this suite
///      needs (prank, expectRevert). Avoids a forge-std submodule dependency; the selectors below
///      are fixed by Foundry's cheatcode ABI, not by this file, so this works exactly like
///      importing forge-std/Vm.sol would.
interface Vm {
    function prank(address) external;
    function expectRevert(bytes calldata revertData) external;
}

/// @dev No test framework import (no forge-std) — assertions below are plain `require`s with
///      messages; Forge picks up any `test*` function in a contract under test/ regardless of
///      inheritance.
contract ScoreRegistryTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    ScoreRegistry registry;
    address owner = address(this);
    address stranger = address(0xBEEF);

    function setUp() public {
        registry = new ScoreRegistry();
    }

    function _sample(uint8 score) internal pure returns (ScoreRegistry.Attestation memory) {
        return ScoreRegistry.Attestation({
            score: score,
            band: 0,
            dims: [uint8(1), 1, 1, 1, 2],
            methodHash: keccak256("anchors@1.0.0|prompt@abc"),
            scoredAt: 1_787_270_020,
            uri: "https://github.com/example/levelfield/blob/main/data/scores/curated-btc-120k.json"
        });
    }

    function test_PublishAndGet() public {
        bytes32 key = keccak256(bytes("curated-btc-120k"));
        ScoreRegistry.Attestation memory a = _sample(3);

        registry.publish(key, a);
        ScoreRegistry.Attestation memory got = registry.get(key);

        require(got.score == 3, "score mismatch");
        require(got.band == 0, "band mismatch");
        require(got.dims[4] == 2, "dims mismatch");
        require(got.methodHash == a.methodHash, "methodHash mismatch");
        require(got.scoredAt == a.scoredAt, "scoredAt mismatch");
        require(keccak256(bytes(got.uri)) == keccak256(bytes(a.uri)), "uri mismatch");
    }

    function test_Get_Unpublished_ReturnsZeroValue() public view {
        ScoreRegistry.Attestation memory got = registry.get(keccak256(bytes("never-published")));
        require(got.score == 0 && got.scoredAt == 0, "expected zero-valued struct");
    }

    function test_PublishBatch() public {
        bytes32[] memory keys = new bytes32[](2);
        keys[0] = keccak256(bytes("curated-btc-120k"));
        keys[1] = keccak256(bytes("curated-fed-rate-cut"));

        ScoreRegistry.Attestation[] memory items = new ScoreRegistry.Attestation[](2);
        items[0] = _sample(3);
        items[1] = _sample(49);

        registry.publishBatch(keys, items);

        require(registry.get(keys[0]).score == 3, "batch item 0 not stored");
        require(registry.get(keys[1]).score == 49, "batch item 1 not stored");
    }

    function test_PublishBatch_LengthMismatch_Reverts() public {
        bytes32[] memory keys = new bytes32[](1);
        keys[0] = keccak256(bytes("curated-btc-120k"));
        ScoreRegistry.Attestation[] memory items = new ScoreRegistry.Attestation[](2);
        items[0] = _sample(3);
        items[1] = _sample(49);

        vm.expectRevert(abi.encodeWithSelector(ScoreRegistry.LengthMismatch.selector));
        registry.publishBatch(keys, items);
    }

    function test_Publish_OnlyOwner_Reverts() public {
        bytes32 key = keccak256(bytes("curated-btc-120k"));
        vm.prank(stranger);
        vm.expectRevert(abi.encodeWithSelector(ScoreRegistry.NotOwner.selector));
        registry.publish(key, _sample(3));
    }

    function test_Publish_Overwrite() public {
        bytes32 key = keccak256(bytes("curated-btc-120k"));
        registry.publish(key, _sample(3));
        registry.publish(key, _sample(90));

        require(registry.get(key).score == 90, "overwrite did not take effect");
    }

    function test_TransferOwnership_TwoStep() public {
        address newOwner = address(0xCAFE);

        registry.transferOwnership(newOwner);
        require(registry.owner() == owner, "owner changed before acceptance");
        require(registry.pendingOwner() == newOwner, "pendingOwner not set");

        vm.prank(newOwner);
        registry.acceptOwnership();
        require(registry.owner() == newOwner, "ownership did not transfer");

        // old owner has lost publish rights
        vm.expectRevert(abi.encodeWithSelector(ScoreRegistry.NotOwner.selector));
        registry.publish(keccak256(bytes("curated-btc-120k")), _sample(3));
    }

    function test_AcceptOwnership_NotPendingOwner_Reverts() public {
        registry.transferOwnership(address(0xCAFE));
        vm.expectRevert(abi.encodeWithSelector(ScoreRegistry.NotPendingOwner.selector));
        registry.acceptOwnership();
    }
}
