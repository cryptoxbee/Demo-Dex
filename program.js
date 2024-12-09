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
                //girdi alma
                let publicEntry = await waitTillPress("Public keyinizi giriniz:  ");
                //geçerli bir adres mi
                let verifyPublicKey = loadingWalletPublic(publicEntry);
                if (!verifyPublicKey) {
                    break;
                }

                //kullanıcının girdiği public keyin hesabını tespit etme
                Object.entries(readData()).forEach(([objectName, object]) => {
                    if (object.publicKey === publicEntry) {
                        tempUserName = objectName;
                    }
                });

                //girdi
                let privateEntry = await waitTillPress("Private Keyinizi giriniz:  ");
                //geçerli private key mi
                let verifyPrivateKey = loadingWalletPrivate(tempUserName, privateEntry);

                if (verifyPrivateKey[0]) {
                    console.log("Başarıyla giriş yapıldı!");
                    //kimlik onaylama
                    userAuth = verifyPrivateKey[1];
                } else {
                    console.log("Yanlış giriş!");
                }
                break;
            case 1: // Cüzdan Oluştur
                console.log("Bu özellik henüz eklenmedi...");
                break;

            case 2: // Havuz likidite ekleme
                //datayı çekme
                const poolData = readData();

                const addedLiquidity = 10000; // Eklenecek token miktarı

                console.log("Havuza çift taraflı likidite ekleniyor...");
                //eldeki dataya ekleme
                poolData.pool.poolTokenA += addedLiquidity;
                poolData.pool.poolTokenB += addedLiquidity;

                // yeni k
                poolData.pool.poolK = poolData.pool.poolTokenA * poolData.pool.poolTokenB;

                // kaydet
                writeData(poolData);

                console.log(`Başarıyla likidite eklendi. Havuzdaki yeni durum:`);
                //mevcut durumu yazdır
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
    //eğer belli bir kullanıcıya bağlanmışsa kullanıcı ekranınyönlendir
    if (userAuth !== null) {
        await userMenu(userAuth);
        userAuth = null;
    }
    //çıkış yaptı mı?
    if (key !== 3) {
        await main();
    }
}


// Programı başlat
main();
