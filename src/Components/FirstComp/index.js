import React from 'react';
import ReactDOM from 'react-dom';
import { ipfs, cluster } from '../../scripts/ipfs'

let cE = require('../../scripts/createEvidence');
let {createEvidence,getHash} = require('../../scripts/createEvidence')

let filesarr = [];

export default class FirstComp extends React.Component {
    constructor(props){
        super(props);
        
        this.state = {
            buffer: null,
            data: "",
            hash1: "",
            files: [],
        }
    }
    
    fileSelectHandle = (e) => {
        const filesArr = e.target.files;
        let files = [] 
        Array.from(filesArr).forEach(file => {
            const filename = file.name;
            const r = new FileReader();
            r.onloadend = () => {
                let fileobj = {
                    path: '/EvidencesDir/'+filename,
                    content: Buffer.from(r.result)
                }
                files.push(fileobj); // Add the other files from a folder or directly 
            }
            r.readAsArrayBuffer(file);
        })
        console.log("FILE OBJ: ", files);
        this.setState({files});
    }
e   
    uploadToIPFS = async (e) => {
        e.preventDefault();
        const {files} = this.state;
        var hash1, clus_hash;
        try {
        ipfs.add(Array.from(files),hashResult);
     
         function hashResult(err,results){
     
                 if (err) { console.log("ERROR: ",err); return;}
                 console.log("RESULT: ",results);
         
                 hash1 = results[results.length-1].hash; // Access hash of only the directory
                 
                 /*
                     1. Create object file with the the folder name as UID 
                         and the IPFS hash in a json file inside this folder.
                 */
             // Make sure the uploaded files are not gc'able and saved to local IPFS repo. 
             // It will still be a hash of a directory and you'll have to access it using ipfs.cat()
                 ipfs.pin.add(hash1, (err, req) => { 
                     if(err) console.log("PIN ERR: ", err);
                     console.log("PINNED: ", req);
                 });
                
         }
         
         // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
         // To check cluster peers connected or not:
        try {
            cluster.add(Array.from(files), async (err,res) =>{
                err? console.log("ERR [CLUS_ADD]: ", err):console.log("CLUS_ADD: \n",res);
                cluster.pin.ls( {filter: 'all'}, (err, res) => {
                    if (err) console.log("ERR [PIN_LS]: ",err)
                    console.log('CLUS PIN LS: ', res[0].cid["/"]);
                    clus_hash = res[0].cid["/"];
                    this.setState({clus_hash});
                    
                })
                // Added setTimeout() to wait for the Promise to resolve
                setTimeout(()=> {
                    console.log("Cluster hash: ",this.state.clus_hash);
                    cluster.pin.rm(clus_hash, (err) => {
                        err ? console.error("UNPIN ERR: ",err) : console.log(`${clus_hash} npinned`)
                    })
                },3000);
            })
        } catch(er){
            ipfs.pin.rm(hash1, (err, req) => { 
            if(err) console.log("PIN {RM} ERR: ", err);
            console.log("PIN {RM}: ", req);
        });
            console.log("IPFS Cluster API could not run, do you have your Cluster daemon server running?")
        }
    } catch(e){ 
        ipfs.pin.rm(hash1, (err, req) => { 
            if(err) console.log("PIN {RM} ERR: ", err);
            console.log("PIN {RM}: ", req);
        });
    }
        
        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    }
    // Testing single object entry in IPFS
    displayImg = () => {
        const {clus_hash} = this.state;
        ipfs.ls(clus_hash, (err, data) => {
            if (err) console.log("Error [IPFS LS] \n", err)

            console.log("NODE DATA [LS]", data)
            data.forEach(d => {
                ipfs.cat(d.hash, (err, file) => {
            if (err) console.log("ERROR [ IPFS CAT ]\n", err)
            
            console.log("NODE DATA [CAT]: ",file);
            // For image data:
            document.getElementById("result").src = "data:image/png;base64, " + 
                        btoa(new Uint8Array(file).reduce((data, byte) => {
                            return data + String.fromCharCode(byte);
                        },''));
                })
            })
        })
    } 
    // Testing multiple object entry in IPFS
    displayDoc = () => {
        const { clus_hash } = this.state;
        ipfs.ls(clus_hash, (err, files) => { // Reading the directory hash
            if (err) console.log("ERROR [ IPFS LS ]\n", err)
            
            console.log("NODE DATA [LS]: ",files);
            files.forEach(file => {     
                ipfs.cat(file.hash, (err, file_cat) => {
                    if (err) console.log("ERROR [ IPFS CAT ]\n", err)
                    //console.log('FILES [CAT]: ',file_cat);
                    var div = document.getElementById("docres");
                    var newlink = document.createElement("a");
                    newlink.href = "https://ipfs.io/ipfs/"+file.hash;
                    newlink.innerHTML = "https://ipfs.io/ipfs/"+file.hash + "<br/>";
                    div.appendChild(newlink);
                });
            })
        })
    }
    render() {
        return( 
            <div>
                <input 
                    type="file" 
                    onChange={this.fileSelectHandle}
                />
                <input 
                    type="submit" 
                    value="Upload"
                    onClick={this.uploadToIPFS}
                />
                <img 
                    id="result"
                    onClick = {this.displayImg}
                    src=""
                    style={
                            { 
                                borderSize: '15px', 
                                borderColor: 'black', 
                                borderStyle: 'solid',
                                height: '50vh',
                                width: '75%',
                                marginHorizontal:'50%',
                                marginVertical: '0px'
                            }
                        }>
                      
                </img>
                    <form 
                        encType="multipart/form-data"
                    >
                        <input 
                        type="file" 
                        onChange={this.fileSelectHandle}
                        multiple
                        />
                        <input 
                            type="submit" 
                            value="Upload"
                            onClick={this.uploadToIPFS}
                        />
                    </form>
                    <div 
                        id="docres"
                        onClick = {this.displayDoc}
                        style={
                                { 
                                    borderSize: '15px', 
                                    borderColor: 'black', 
                                    borderStyle: 'solid',
                                    height: '50vh',
                                    width: '75%',
                                    marginHorizontal:'50%',
                                    marginVertical: '0px'
                                }
                            }

                    >    
                    </div>
            </div>
        );
    }
}

export { filesarr }