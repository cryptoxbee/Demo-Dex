const { resolve } = require("path");
const readline = require("readline");
const { loadingWalletPublic, loadingWalletPrivate, waitTillPress } = require("./menuFuncs.js");
const { writeData, readData } = require("./fs.js");
const { userMenu } = require("./userMenu.js");

let userAuth = null;

let key = false;
let loginScreen = [
    { anahtar: 0, seçenek: "Cüzdan Bağla" },
    { anahtar: 1, seçenek: "Cüzdan Oluştur(Çalışmıyor)" },
    { anahtar: 2, seçenek: "Havuza 10k-10k likidite ekle" },
    { anahtar: 3, seçenek: "Çıkış Yap" }
];



async function main() {
    console.table(loginScreen);
    key = Number(await waitTillPress('Lütfen anahtar kod ile ne yapmak istediğinizi belirtiniz:  '));

    if (isNaN(key)) {
        console.log("Geçersiz giriş. Lütfen geçerli bir sayı girin.");
        return;
    }

    if (userAuth === null) {
        switch (key) {
            case 0: // Cüzdan Bağla
                let tempUserName = null;
                console.log("Cüzdan Bağlama işlemi başlıyor...");
                let publicEntry = await waitTillPress("Public keyinizi giriniz:  ");
                let verifyPublicKey = loadingWalletPublic(publicEntry);
                if (!verifyPublicKey) {
                    break;
                }
                Object.entries(readData()).forEach(([objectName, object]) => {
                    if (object.publicKey === publicEntry) {
                        tempUserName = objectName;
                    }
                });

                let privateEntry = await waitTillPress("Private Keyinizi giriniz:  ");
                let verifyPrivateKey = loadingWalletPrivate(tempUserName, privateEntry);

                if (verifyPrivateKey[0]) {
                    console.log("Başarıyla giriş yapıldı!");
                    userAuth = verifyPrivateKey[1];
                } else {
                    console.log("Yanlış giriş!");
                }
                break;
            case 1: // Cüzdan Oluştur
                console.log("Bu özellik henüz eklenmedi...");
                break;

            case 2: // Havuz likidite ekleme
                const poolData = readData();

                if (!poolData.pool) {
                    console.log("Havuz bilgileri bulunamadı, işlem durduruldu.");
                    break;
                }

                const addedLiquidity = 10000; // Eklenecek token miktarı

                console.log("Havuza çift taraflı likidite ekleniyor...");
                poolData.pool.poolTokenA += addedLiquidity;
                poolData.pool.poolTokenB += addedLiquidity;

                // Yeni K hesaplanıyor
                poolData.pool.poolK = poolData.pool.poolTokenA * poolData.pool.poolTokenB;

                // Güncellenmiş havuz verileri kaydediliyor
                writeData(poolData);

                console.log(`Başarıyla likidite eklendi. Havuzdaki yeni durum:`);
                console.table([
                    { Token: "Token A", Miktar: poolData.pool.poolTokenA },
                    { Token: "Token B", Miktar: poolData.pool.poolTokenB },
                    { Token: "K Sabiti", Değer: poolData.pool.poolK },
                ]);

                break;

            case 3: // Çıkış
                console.log("Program sonlanıyor...");
                process.exit();  // Programı sonlandır
            default:
                console.log("Geçersiz seçim, lütfen tekrar deneyin.");
        }
    }

    if (userAuth !== null) {
        await userMenu(userAuth);
        userAuth = null;
    }

    if (key !== 3) {
        await main();
    }
}


// Programı başlat
main();
