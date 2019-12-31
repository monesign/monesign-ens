// function to register a label, store an address and abi

module.exports = async function registerLabelAndStoreAddressAndAbi(
    ENSArtifacts, ContractArtifact, web3, label, tld
){

    const ENSArtifact = ENSArtifacts.registry;
    const RegistrarArtifact = ENSArtifacts.registrar;
    const ResolverArtifact = ENSArtifacts.resolver;

    const netId = web3.version.network;

    // get the ownership of this domain
    const name = `${label}.${tld}`;
    const labelhash = web3.sha3(label);
    const node = require('eth-ens-namehash').hash(name);

    // the contract that the domain point to
    const contractAddress = ContractArtifact.networks[netId].address.toLowerCase();

    // the deploying account will own the domain, all transactions modifying node records
    // will have to performed from this account (deploying account)
    const owner = web3.eth.accounts[0].toLowerCase();

    // Get ENS contract instances
    const registry = await ENSArtifact.at(ENSArtifact.networks[netId].address);
    const registrar = await RegistrarArtifact.at(RegistrarArtifact.networks[netId].address);
    const resolver = await ResolverArtifact.at(ResolverArtifact.networks[netId].address);

    // Register mycontract.<tld>, it is related with WHO owns the conntract verification
    await registrar.register(labelhash, owner, {from: owner});
    if ((await registry.owner(node)).toLowerCase() !== owner) {
        throw `Failed to register '${name}'`;
    } else {
        console.log(`Successfully registered '${name}' (label ${labelhash}, node '${node}')`);
    }

    // Set the resolver, to compare address in registry's resolver address with resolver's address
    await registry.setResolver(node, resolver.address);
    if ((await registry.resolver(node)).toLowerCase() !== resolver.address.toLowerCase()) {
        throw `Failed to set resolver for '${name}'`;
    } else {
        console.log(`Successfully set resolver for '${name}'`);
    }

    // Store the address of the deployed contract with the resolver
    await resolver.setAddr(node, contractAddress);
    if ((await resolver.addr(node)).toLowerCase() !== contractAddress) {
        throw `Failed to set address in resolver for '${name}'`;
    } else {``
        console.log(`Successfully set address ${contractAddress} for '${name}' in resolver`);
    }

    const hexAbi = web3.toHex(ContractArtifact.abi); // Objects are JSON.stringified first
    await resolver.setABI(node, 0x1, hexAbi, {from: owner});
    const storedAbiString = web3.toAscii((await resolver.ABI(node, 0x1))[1]);
    if (JSON.stringify(ContractArtifact.abi) !== storedAbiString) {
        throw `Failed to store ABI in resolver for '${name}'`;
    } else {
        console.log(`Successfully set ABI for '${name}' in resovler`);
    }
}
