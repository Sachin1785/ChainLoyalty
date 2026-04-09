// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Referral {
    mapping(address => address) public referrers;
    mapping(address => uint256) public referralCounts;
    mapping(address => bool) public isVerifiedPerson; // Anti-sybil check
    
    event Referred(address indexed user, address indexed referrer);
    event PersonVerified(address indexed user);

    function verifyPerson(address user) external {
        // Mock integration with Self Protocol for Proof-of-Personhood
        // This ensures sybil protection by verifying real humans
        isVerifiedPerson[user] = true;
        emit PersonVerified(user);
    }

    function registerReferral(address referrer) external {
        require(isVerifiedPerson[msg.sender], "Sybil protection: not a verified person");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(referrers[msg.sender] == address(0), "Already referred by someone");
        
        referrers[msg.sender] = referrer;
        referralCounts[referrer]++;
        
        emit Referred(msg.sender, referrer);
    }

    function getReferralCount(address user) external view returns (uint256) {
        return referralCounts[user];
    }
}
