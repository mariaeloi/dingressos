// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TicketManager {
    address public owner;
    address[] public ticketsContracts;
    mapping(address => address[]) public userTicketsContracts;

    event TicketContractCreated(address indexed ticketContract, address indexed creator);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createTicketContract(string memory name, string memory id, uint startAmount, uint startPrice, string memory date, string memory local) public {
        Ticket newTicketContract = new Ticket(name, id, startAmount, startPrice, msg.sender, date, local);
        address newTicketContractAddress = address(newTicketContract);
        userTicketsContracts[msg.sender].push(newTicketContractAddress);
        ticketsContracts.push(newTicketContractAddress);
        emit TicketContractCreated(newTicketContractAddress, msg.sender);
    }

    function getUserTicketContracts() external view returns (address[] memory) {
        return userTicketsContracts[msg.sender];
    }

    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function getTicketContracts() external view returns (address[] memory) {
        return ticketsContracts;
    }

    function receiveFee() external payable {}
}

contract Ticket is ERC721 {
    string ticketSymbol;
    address public owner;
    address public ticketManagerAddress;
    uint256 public ticketPrice;
    uint256 public ticketId = 0;
    uint256 public amount;
    string public date;
    string public local;


    mapping(uint256 => uint256) public ticketPriceAtPurchase;
    mapping(address => uint256[]) public userTickets;

    event TicketPurchased(address indexed buyer, uint256 ticketId, uint256 price);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only contract owner can perform this action");
        _;
    }

    constructor(string memory name, string memory id, uint _amount, uint256 _ticketPrice, address _owner, string memory _date, string memory _local) ERC721(name, id) {
        owner = _owner;
        ticketSymbol = id;
        ticketPrice = _ticketPrice;
        amount = _amount;
        date = _date;
        local = _local;
        ticketManagerAddress = msg.sender;
    }

    function buyTicket() external payable {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(ticketId < amount, "tickets sold out");
        uint256 tokenId = ticketId++;
        _mint(msg.sender, tokenId);
        ticketPriceAtPurchase[tokenId] = msg.value;
        userTickets[msg.sender].push(tokenId);
        emit TicketPurchased(msg.sender, tokenId, msg.value);
    }

    function getTicket(uint256 _tokenId) external view returns (uint256 priceAtPurchase) {
        return ticketPriceAtPurchase[_tokenId];
    }

    function getUserTickets() external view returns (uint256[] memory) {
        return userTickets[msg.sender];
    }

    function setTicketPrice(uint256 _newPrice) external onlyOwner {
        ticketPrice = _newPrice;
    }

    function setAmount(uint newAmount) external onlyOwner {
        amount = newAmount;
    }

    function setPrice(uint newPrice) external onlyOwner {
        ticketPrice = newPrice;
    }

    function getTicketManagerAmount() external view returns (uint) {
        uint ticketManagerAmount = (address(this).balance*10)/100;
        return ticketManagerAmount;
    }

    function getOwnerAmount() external view returns (uint) {
        uint ticketManagerAmount = (address(this).balance*10)/100;
        uint ownerAmount = address(this).balance - ticketManagerAmount;
        return ownerAmount;
    }

    function withdraw() external onlyOwner {
        uint ticketManagerAmount = (address(this).balance*10)/100;
        uint ownerAmount = address(this).balance - ticketManagerAmount;
        TicketManager(ticketManagerAddress).receiveFee{value: ticketManagerAmount}();
        payable(owner).transfer(ownerAmount);
    }

    function setDate(string memory newDate) external onlyOwner{
        date = newDate;
    }

    function setLocal(string memory newLocal) external onlyOwner{
        local = newLocal;
    }

    function getTicketEvent() external view returns (
        address tokenContract,
        address creator,
        string memory title,
        string memory symbol,
        string memory location,
        string memory datetime,
        uint price,
        uint ticketsAvailable
    ) {
        uint _ticketsAvailable = 0;
        if (amount > ticketId) {
            _ticketsAvailable = amount - ticketId;
        }
        return (address(this), owner, name(), ticketSymbol, local, date, ticketPrice, _ticketsAvailable);
    }
}
