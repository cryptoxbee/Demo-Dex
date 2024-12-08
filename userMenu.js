const { resolve } = require("path");
const readline = require("readline");
const { loadingWalletPublic, loadingWalletPrivate, waitTillPress } = require("./menuFuncs.js");
const { writeData, readData } = require("./fs.js");
const { read } = require("fs");


async function swapTokensWithPool(userAuth, sendTokenChoice, sendTokenAmount) {
    let walletData = readData();
    let userData = walletData[userAuth];
    let poolData = walletData["pool"];

    if (!poolData) {
        console.log("Havuz bulunamadı.");
        return;
    }

    let poolTokenA = poolData.poolTokenA;
    let poolTokenB = poolData.poolTokenB;

    if (sendTokenChoice === 0) {
        if (userData.userTokenA < sendTokenAmount) {
            console.log("Yeterli TokenA yok.");
            return;
        }

        let newPoolTokenA = poolTokenA + sendTokenAmount;
        let newPoolTokenB = poolData.poolK / newPoolTokenA;

        let receivedTokenB = poolTokenB - newPoolTokenB;

        if (receivedTokenB > poolTokenB) {
            console.log("Havuzda yeterli TokenB yok.");
            return;
        }

        userData.userTokenA -= sendTokenAmount;
        userData.userTokenB += receivedTokenB;

        poolData.poolTokenA = newPoolTokenA;
        poolData.poolTokenB = newPoolTokenB;

        console.log(`Başarıyla takas yapıldı: ${receivedTokenB.toFixed(2)} TokenB alındı.`);
    } else if (sendTokenChoice === 1) {
        if (userData.userTokenB < sendTokenAmount) {
            console.log("Yeterli TokenB yok.");
            return;
        }

        let newPoolTokenB = poolTokenB + sendTokenAmount;
        let newPoolTokenA = poolData.poolK / newPoolTokenB;

        let receivedTokenA = poolTokenA - newPoolTokenA;

        if (receivedTokenA > poolTokenA) {
            console.log("Havuzda yeterli TokenA yok.");
            return;
        }

        userData.userTokenB -= sendTokenAmount;
        userData.userTokenA += receivedTokenA;

        poolData.poolTokenA = newPoolTokenA;
        poolData.poolTokenB = newPoolTokenB;

        console.log(`Başarıyla takas yapıldı: ${receivedTokenA.toFixed(2)} TokenA alındı.`);
    } else {
        console.log("Geçersiz seçim.");
        return;
    }

    walletData[userAuth] = userData;
    walletData["pool"] = poolData;
    writeData(walletData);
}




async function userMenu(userAuth) {
    const userMenuScreen = [
        { anahtar: 0, seçenek: "Takas" },
        { anahtar: 1, seçenek: "Transfer" },
        { anahtar: 2, seçenek: "Cüzdan durumu" },
        { anahtar: 3, seçenek: "Çıkış yap" }
    ];

    console.table(userMenuScreen);

    let choiceUserMenu = Number(await waitTillPress('Lütfen bir seçenek girin: '));

    switch (choiceUserMenu) {
        case 0: // Takas
            let swapTokenOptions = [
                { anahtar: 0, seçenek: "TokenA gönder, TokenB al" },
                { anahtar: 1, seçenek: "TokenB gönder, TokenA al" }
            ];
            console.table(swapTokenOptions);

            let swapChoice = Number(await waitTillPress('Hangi takası yapmak istiyorsunuz (0/1)? '));
            if (![0, 1].includes(swapChoice)) {
                console.log("Geçersiz seçenek, işlem durduruldu.");
                break;
            }

            let swapAmount = Number(await waitTillPress('Göndermek istediğiniz token miktarını giriniz: '));
            if (isNaN(swapAmount) || swapAmount <= 0) {
                console.log("Geçersiz miktar, işlem durduruldu.");
                break;
            }

            await swapTokensWithPool(userAuth, swapChoice, swapAmount);
            break;



        case 1: // Transfer için
            let sendPublic = await waitTillPress('Gönderilecek cüzdanın public adresini giriniz: ');

            let walletData = readData();

            if (!Object.values(walletData).some((object) => object.publicKey === sendPublic)) {
                console.log("Geçersiz adres, işlem durduruldu.");
                break;
            }

            let tokens = [
                { anahtar: 0, seçenek: "TokenA" },
                { anahtar: 1, seçenek: "TokenB" },

            ]
            console.table(tokens);
            console.log();
            let sendTokenChoice = Number(await waitTillPress('Hangi cinsten göndereceğini seç: '));
            let sendTokenAmount = Number(await waitTillPress('Gönderilecek adeti giriniz: '));

            let continueTransfer = false;

            for (const [objectName, object] of Object.entries(walletData)) {
                if (objectName === userAuth) {
                    if (sendTokenChoice === 0 && object.userTokenA >= sendTokenAmount) {
                        console.log("İşlem devam ediyor...");
                    } else if (sendTokenChoice === 1 && object.userTokenB >= sendTokenAmount) {
                        console.log("İşlem devam ediyor...");
                    } else {
                        console.log("Yeterli token yok!");
                        break;
                    }
                }
            }




            if (sendTokenChoice === 0) {
                walletData[userAuth].userTokenA -= sendTokenAmount;
            }
            else if (sendTokenChoice === 1) {
                walletData[userAuth].userTokenB -= sendTokenAmount;
            }

            Object.entries(walletData).forEach(([objectName, object]) => {
                if (object.publicKey === sendPublic) {
                    if (sendTokenChoice === 0) {
                        object.userTokenA += sendTokenAmount;
                    } else if (sendTokenChoice === 1) {
                        object.userTokenB += sendTokenAmount;
                    }
                }
            })

            writeData(walletData);

            console.log("Transfer başarıyla tamamlandı.");





            break;
        case 2: // Cüzdan durumu
            const walletDataa = readData();

            if (!walletDataa[userAuth]) {
                console.log("Cüzdan bulunamadı, işlem durduruldu.");
                break;
            }

            console.table([
                { Token: "Token A", Miktar: walletDataa[userAuth].userTokenA },
                { Token: "Token B", Miktar: walletDataa[userAuth].userTokenB },
            ]);

            break;

        case 3: // Çıkış yap
            console.log("Çıkış yapılıyor...");
        default:
            console.log("Geçersiz seçim, lütfen tekrar deneyin.");
            break;
    }



    if (choiceUserMenu !== 3) {
        await userMenu(userAuth);
    }
}
module.exports = { userMenu };
