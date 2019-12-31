pragma solidity ^0.5;

import "../contracts/ENSReader.sol";
import "../contracts/Registrar.sol";

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";

contract TestContractWorkflow is ENSReader(DeployedAddresses.ENSRegistry()){

    bytes32 private node = 0xc08a64fdfe9c967d3703ee0ef2ed124b20506362287234833c08ecb588342b98;

    function testAddressLookup() public {
        address resolverAddrForNode = addressOf(node);
        Assert.equal(resolverAddrForNode, address(this), "Address lookup returns stored address");
    }

    function testTextLookup() public {
        string memory resolverTextForNode = textOf(node, key);
        Assert.equal(resolverTextForNode, someData, "Text lookup returns stored data");
    }

    bytes32 private tldNamehash = 0x6a799be0031f26a569b124997159d5a3dfdbf89e7d75e43fdf998a236774f771;

    string private someData = "This data is stored in the resolver";
    string private key = "key";

    constructor() public {
        Registrar registrar = Registrar(DeployedAddresses.FIFSRegistrar());
        registrar.register(keccak256(abi.encodePacked("mone")), address(this));
        ens.setResolver(node, DeployedAddresses.PublicResolver());
        Resolver(DeployedAddresses.PublicResolver()).setAddr(node, address(this));
        Resolver(DeployedAddresses.PublicResolver()).setText(node, key, someData);
    }

    function testSetup() public {
        Assert.equal(
            ens.owner(tldNamehash),
            DeployedAddresses.FIFSRegistrar(),
            "Owner of eth is the registrar"
        );
        Assert.equal(
            ens.owner(node),
            address(this),
            "Owner of registered domain is this contract"
        );
        Assert.equal(
            ens.resolver(node),
            DeployedAddresses.PublicResolver(),
            "Resolver for the test.eth node is set in registry"
        );
    }


}
