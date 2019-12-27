const ENS = artifacts.require("ENSRegistry.sol");
const FIFSRegistrar = artifacts.require("FIFSRegistrar.sol");

const web3 = new (require('web3'));
const namehash = require('eth-ens-namehash');


// Calculate root node hashes from the top of tld (top level domain)
function getRootNodeFromTLD(tld) {
    return {
        namehash: namehash.hash(tld),
        sha3: web3.sha3(tld)
    };
}

// Deploy ENS and FIFSRegistrar
async function deployFIFSRegistrar(deployer, tld) {
    var rootNode = getRootNodeFromTLD(tld);
    let ensInstance, registrarInstance;

    deployer.deploy(ENS)
        .then(function (instance) {
            ensInstance = instance;
            return deployer.deploy(FIFSRegistrar, ensInstance.address, rootNode.namehash);
        }).then(function (instance) {
        registrarInstance = instance;
        return ensInstance.setSubnodeOwner('0x0', rootNode.sha3, registrarInstance.address);
    }).then(function (receipt) {
        console.log(`Status: ${receipt.receipt.status}`)
    })
}

module.exports = function(deployer, network){
  var tld = 'eth';
  deployFIFSRegistrar(deployer, tld);
}
