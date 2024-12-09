const readline = require("readline");

const { writeData, readData } = require("./fs.js");

const loginChocie = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Public key ile kullanıcıyı kontrol etme
function loadingWalletPublic(entry) {
    const data = readData();
    return Object.values(data).some(user => user.publicKey === entry);
}

// Private key ile kullanıcıyı kontrol etme
function loadingWalletPrivate(tempUserName, entry) {
    const data = readData();
    // Kullanıcı adı ve privateKey kontrolü
    const user = Object.entries(data).find(([objectName, object]) => {
        return objectName === tempUserName && object.privateKey === entry;
    });
    // Eğer uygun kullanıcı bulunursa, kullanıcı adı (objectName) ve 'true' döndürülür
    return user ? [true, user[0]] : [false, null];
}


// Kullanıcıdan giriş almayı bekleyen fonksiyon
function waitTillPress(question) {
    return new Promise((resolve, reject) => {
        loginChocie.question(question, tempKey => {
            resolve(tempKey);
        })
    });
}

//public/privatekey üretme
function generateKey(lengthOfKey) {
    let key = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567899';
    for (let i = 0; i < lengthOfKey; i++) {
        key += String(characters[Math.floor(Math.random() * (characters.length))]);//rastgele karakter ekle
    }


    return key;
}



//yeni cüzdan üretme
function createNewWallet() {
    //datayı alma 
    let firstCreateData = readData();
    let createUserName = "user" + String(Math.floor((Math.random() * 1000000000)));
    firstCreateData[createUserName] = {
        publicKey: generateKey(8),
        privateKey: generateKey(10),
        userTokenA: 0,
        userTokenB: 0
    };
    writeData(firstCreateData);
    console.table(firstCreateData[createUserName]);
    console.log('Cüzdanınız oluşturuldu! İşte bilgileriniz.')




}

module.exports = { loadingWalletPublic, loadingWalletPrivate, waitTillPress, createNewWallet };
