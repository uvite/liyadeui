import CryptoJS from 'crypto-js'
import JSEncrypt from 'jsencrypt'

//const NodeRSA =  require('node-rsa')

function rsaEncrypt(data, publicKey) {
    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    console.log(encrypt.encrypt(data))
    return encrypt.encrypt(data)
}


function rsaDecrypt(data, privateKey) {
    let encrypt = new JSEncrypt();
    encrypt.setPrivateKey(privateKey);
    console.log(encrypt.decrypt(data))
    return encrypt.decrypt(data)
}

function md5Encrypt(data) {
    return CryptoJS.MD5(data).toString();
}

// function createRsaKeyPair(length, func) {
//     const key = new NodeRSA({ b: length }); //生成512, 1024, 2048位的密钥
//     const publicDer = key.exportKey("pkcs8-public-pem"); //公钥
//     const privateDer = key.exportKey('pkcs8-private-pem');//私钥
//     // 'pkcs1' — public key starts from '-----BEGIN RSA PUBLIC KEY-----' header and private key starts from '-----BEGIN RSA PRIVATE KEY-----' header
//     // 'pkcs8' — public key starts from '-----BEGIN PUBLIC KEY-----' header and private key starts from '-----BEGIN PRIVATE KEY-----' header
//     // 'pem'— 带有页眉和页脚的 Base64 编码字符串。默认使用。
//     // 'der' — 二进制编码的密钥数据。
//     return func(privateDer, publicDer);
// }


function createRsaKeyPair(length,type,func){
    window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: length, //can be 1024, 2048, or 4096
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {name: type}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
        },
        true, //whether the key is extractable (i.e. can be used in exportKey)
        ["encrypt", "decrypt"] //must be ["encrypt", "decrypt"] or ["wrapKey", "unwrapKey"]
    ).then(function(key){
        window.crypto.subtle.exportKey(
            "pkcs8",
            key.privateKey
        ).then(function(keydata1){
            window.crypto.subtle.exportKey(
                "spki",
                key.publicKey
            ).then(function(keydata2){
                var privateKey = RSA2text(keydata1,1);
                var publicKey = RSA2text(keydata2);
                func(privateKey,publicKey);
            }).catch(function(err){
                console.error(err);
            });
        })
            .catch(function(err){
                console.error(err);
            });
    })
        .catch(function(err){
            console.error(err);
        });
}
function RSA2text(buffer,isPrivate=0) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    var base64 = window.btoa(binary);
    var text = "-----BEGIN "+(isPrivate?"PRIVATE":"PUBLIC")+" KEY-----\n";
    text += base64.replace(/[^\x00-\xff]/g,"$&\x01").replace(/.{64}\x01?/g,"$&\n");
    text += "\n-----END "+(isPrivate?"PRIVATE":"PUBLIC")+" KEY-----";
    return text;
}

export {rsaEncrypt, rsaDecrypt, md5Encrypt, createRsaKeyPair}
