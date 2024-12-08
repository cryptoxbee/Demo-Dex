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
    return user ? [true, user[0]] : [false, null];  // user[0] objectName'ı temsil eder
}


// Kullanıcıdan giriş almayı bekleyen fonksiyon
function waitTillPress(question) {
    return new Promise((resolve, reject) => {
        loginChocie.question(question, tempKey => {
            resolve(tempKey);
        })
    });
}

module.exports = { loadingWalletPublic, loadingWalletPrivate, waitTillPress };
