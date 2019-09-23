/**
 * IPFS JS API:
 * 1. Make your local machine an IPFS node. [ With 'js-ipfs' API ] ~ ipfs init
 * 2. Start the Daemon server.[ With 'ipfsd-ctl' API ] ~ ipfs daemon
 * 3. Intiailize object of IPFS Client API for actually using it. [ With 'js-ipfs-http-client' API ] 
 *        ~ ipfs add, get, ls etc 
 * 
 * Abandoning the Daemon and initiatilization of IPFS.
 * - Need to perform those two seperately via CLI on user machine 
 *   and deploy with the help of an integrated build of this IPFS connectivity.
 */ 

const ipfsClient = require('ipfs-http-client');
const ipfsCluster = require('ipfs-cluster-api');

const ipfs = ipfsClient({ host: '0.0.0.0', port: '5001'});
const cluster = ipfsCluster({ host: '127.0.0.1', port: '9094'});

cluster.peers.ls((err,res) => {
    if (err) return
  console.log("CLUSTER PEERS: ", res);    
})
export { ipfs, cluster }