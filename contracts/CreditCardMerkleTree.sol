
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CreditCardMerkleTree {
    bytes32 public merkleRoot;
    
    struct CreditCard {
        bytes32 hashedNumber;
        uint256 expirationDate;
        address owner;
    }
    
    mapping(bytes32 => CreditCard) public creditCards;
    
    event CreditCardAdded(bytes32 indexed hashedNumber, uint256 expirationDate, address owner);
    
    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }
    
    function addCreditCard(bytes32 _hashedNumber, uint256 _expirationDate, bytes32[] memory _merkleProof) public {
        require(verifyCreditCard(_hashedNumber, _merkleProof), "Invalid Merkle proof");
        
        creditCards[_hashedNumber] = CreditCard({
            hashedNumber: _hashedNumber,
            expirationDate: _expirationDate,
            owner: msg.sender
        });

        emit CreditCardAdded(_hashedNumber, _expirationDate, msg.sender);
    }
    
    function verifyCreditCard(bytes32 _hashedNumber, bytes32[] memory _merkleProof) public view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(_hashedNumber));
        return MerkleProof.verify(_merkleProof, merkleRoot, leaf);
    }
    
    function getCreditCardInfo(bytes32 _hashedNumber) public view returns (uint256, address) {
        CreditCard memory card = creditCards[_hashedNumber];
        require(card.owner != address(0), "Credit card not found");
        return (card.expirationDate, card.owner);
    }
}
