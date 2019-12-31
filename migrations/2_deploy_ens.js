var ENS = artifacts.require("@ensdomains/ens/ENSRegistry");
var FIFSRegistrar = artifacts.require("@ensdomains/ens/FIFSRegistrar");
var PublicResolver = artifacts.require("@ensdomains/resolver/PublicResolver");
// var PublicResolver = artifacts.require('PublicResolver');

const web3 = new (require('web3'));
const namehash = require('eth-ens-namehash');


// // Calculate root node hashes from the top of tld (top level domain)
// function getRootNodeFromTLD(tld) {
//     return {
//         namehash: namehash.hash(tld),
//         sha3: web3.sha3(tld)
//     };
// }
//
// // Deploy ENS and FIFSRegistrar
// async function deployFIFSRegistrar(deployer, tld) {
//     var rootNode = getRootNodeFromTLD(tld);
//     let ensInstance, registrarInstance;
//
//     deployer.deploy(ENS)
//         .then(function (instance) {
//             ensInstance = instance;
//             return deployer.deploy(FIFSRegistrar, ensInstance.address, rootNode.namehash);
//         }).then(function (instance) {
//         registrarInstance = instance;
//         return ensInstance.setSubnodeOwner('0x0', rootNode.sha3, registrarInstance.address);
//     }).then(function (receipt) {
//         console.log(`Monesign Deployment Status: ${receipt.receipt.status}`)
//     })
// }

module.exports = function(deployer, network){
  var tld = 'sign';
  // deployFIFSRegistrar(deployer, tld);
  let ensInstance, registrarInstance;
  const tldNode = namehash.hash(tld);
  const tldLabelhash = web3.sha3(tld);

  // 1. Deploy the registry
    deployer.deploy(ENS)
        .then(function(instance){
            ensInstance = instance;

            // 2. deploy the registrar
            return deployer.deploy(FIFSRegistrar, ensInstance.address, tldNode);
        }).then(function (instance) {
        console.log(`Registrar administers '${tld}' (node '${tldNode}')`)
        registrarInstance = instance;

        // 3. make registrar owner of the tld
        return ensInstance.setSubnodeOwner('0x0', tldLabelhash, registrarInstance.address);
    }).then(function(receipt) {
        console.log(`Registrar is now owner of '${tld}' (label '${tldLabelhash}') in the registry`)
        console.log(`Monesign Deployment Status: ${receipt.receipt.status}`);
        // Step 4: deploy resolver
        return deployer.deploy(PublicResolver, ensInstance.address);
    })
};
