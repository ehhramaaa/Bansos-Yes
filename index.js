const { headerGetToken, headerWithToken } = require('./header')
const { SocksProxyAgent } = require('socks-proxy-agent');
const { StoreSession } = require("telegram/sessions");
const { Api, TelegramClient } = require("telegram");
const register = require("./register")
const { clear } = require('console');
const fetch = require("node-fetch")
const input = require("input");
const fs = require("fs");

const apiId = 28285888;
const apiHash = "144e7bafbe0ac8c60a7cd56133b91add";
const apiUrl = "https://api.yescoin.gold";
const sessionPath = "./sessions/"
const phonePath = "./phone.txt"
const proxyDomain = [
    "tor.socks.ipvanish.com",
    "par.socks.ipvanish.com",
    "fra.socks.ipvanish.com",
    "lin.socks.ipvanish.com",
    "nrt.socks.ipvanish.com",
    "ams.socks.ipvanish.com",
    "waw.socks.ipvanish.com",
    "lis.socks.ipvanish.com",
    "sin.socks.ipvanish.com",
    "mad.socks.ipvanish.com",
    "sto.socks.ipvanish.com",
    "iad.socks.ipvanish.com",
    "atl.socks.ipvanish.com",
    "chi.socks.ipvanish.com",
    "dal.socks.ipvanish.com",
    "den.socks.ipvanish.com",
    "lax.socks.ipvanish.com",
    "lon.socks.ipvanish.com",
    "nyc.socks.ipvanish.com",
    "mia.socks.ipvanish.com",
    "phx.socks.ipvanish.com",
    "syd.socks.ipvanish.com",
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkIp(proxy) {
    try {
        const response = await fetch(`https://freeipapi.com/api/json`, { agent: proxy });
        const data = await response.json();
        return [data.ipAddress, data.countryName];
    } catch (error) {
        console.error('Error fetching IP details:', error.message);
        return error;
    }
}

async function getAccessToken(authData, retryCount = 3, proxy) {
    try {
        const response = await fetch(`${apiUrl}/user/login`, {
            method: 'POST',
            headers: headerGetToken,
            body: JSON.stringify({
                code: authData.trim()
            }),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if ('token' in responseJson.data) {
            console.log('Successfully Get Access Token');
            return responseJson.data.token;
        } else {
            console.log('No access token found in the response.');
            if (retryCount > 0) {
                console.log(`Retrying... attempts left: ${retryCount}`);
                return getAccessToken(authData, retryCount - 1, proxy);
            } else {
                throw new Error('Failed to get access token after multiple attempts.');
            }
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function getAccountInfo(accessToken, proxy) {
    console.log("[ACCOUNT INFO]")

    try {
        const response = await fetch(`${apiUrl}/account/getAccountInfo`, {
            method: 'GET',
            headers: headerWithToken(accessToken),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        console.log('User ID\t\t:', responseJson.data.userId)
        console.log('Current Balance :', responseJson.data.currentAmount)
        console.log('Invite Amount\t:', responseJson.data.inviteAmount)
        console.log('User Level\t:', responseJson.data.userLevel)
        console.log('Rank\t\t:', responseJson.data.rank)

    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function getAccountBuildInfo(accessToken, proxy) {
    console.log("[BOOST MENU]")

    try {
        const response = await fetch(`${apiUrl}/build/getAccountBuildInfo`, {
            method: 'GET',
            headers: headerWithToken(accessToken),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        console.log('Special Box Balance\t:', responseJson.data.specialBoxLeftRecoveryCount)
        console.log('Refill Coin Balance\t:', responseJson.data.coinPoolLeftRecoveryCount)
        console.log('Recovery Pool Level\t:', responseJson.data.coinPoolRecoveryLevel)
        console.log('Upgrade Recovery Price\t:', responseJson.data.coinPoolRecoveryUpgradeCost)
        console.log('Click Rate Level\t:', responseJson.data.singleCoinLevel)
        console.log('Upgrade Click Rate Price:', responseJson.data.singleCoinUpgradeCost)
        console.log('Coin Limit Level\t:', responseJson.data.coinPoolTotalLevel)
        console.log('Upgrade Coin Limit Price:', responseJson.data.coinPoolTotalUpgradeCost)

        return [responseJson.data.singleCoinLevel, responseJson.data.specialBoxLeftRecoveryCount, responseJson.data.coinPoolLeftRecoveryCount]

    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function collectCoin(accessToken, clickLevel, proxy) {
    console.log("[COLLECT COIN]")

    let collectCoin = true
    let click

    do {
        if (clickLevel <= 5) {
            click = Math.floor(Math.random() * (400 - 200 + 1)) + 200
        } else {
            click = Math.floor(Math.random() * (50 - 10 + 1)) + 10
        }

        try {
            const response = await fetch(`${apiUrl}/game/collectCoin`, {
                method: 'POST',
                headers: headerWithToken(accessToken),
                body: click,
                agent: proxy
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseJson = await response.json();

            if (responseJson.message === 'left coin not enough') {
                collectCoin = false
                console.log('All Coin Successfully Collected')
            } else {
                console.log('Success Collect Coin:', responseJson.data.collectAmount)
                await sleep(Math.floor(Math.random() * (500 - 300 + 1)) + 300)
            }
        } catch (error) {
            console.error('Error:', error.message);
            throw error;
        }
    } while (collectCoin)
}

async function claimSpecialBox(accessToken, proxy) {
    console.log("[CLAIM SPECIAL BOX]")

    try {
        const response = await fetch(`${apiUrl}/game/recoverSpecialBox`, {
            method: 'POST',
            headers: headerWithToken(accessToken),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.message === 'Success') {
            console.log("claimSpecialBox:", responseJson.message)
        } else {
            console.log("claimSpecialBox:", responseJson.message)
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function getSpecialBox(accessToken, clickLevel, proxy) {
    try {
        const response = await fetch(`${apiUrl}/game/getSpecialBoxInfo`, {
            method: 'GET',
            headers: headerWithToken(accessToken),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.data.recoveryBox !== null) {
            await specialBoxReloadPage(accessToken, clickLevel, proxy)
        } else {
            console.log("getSpecialBox:", responseJson.data.recoveryBox)
        }

    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function specialBoxReloadPage(accessToken, clickLevel, proxy) {
    try {
        const response = await fetch(`${apiUrl}/game/specialBoxReloadPage`, {
            method: 'POST',
            headers: headerWithToken(accessToken),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.message === 'Success') {
            await collectSpecialBoxCoin(accessToken, clickLevel, proxy)
        } else {
            console.log("specialBoxReloadPage:", responseJson.message)
        }


    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function collectSpecialBoxCoin(accessToken, clickLevel, proxy) {
    let click
    if (clickLevel <= 5) {
        click = Math.floor(Math.random() * (300 - 100 + 1)) + 100
    } else {
        click = Math.floor(Math.random() * (50 - 10 + 1)) + 10
    }
    try {
        const response = await fetch(`${apiUrl}/game/collectSpecialBoxCoin`, {
            method: 'POST',
            headers: headerWithToken(accessToken),
            body: JSON.stringify({ "boxType": 2, "coinCount": click }),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.message === 'Success') {
            console.log('Success Collect Prize Box:', responseJson.data.collectAmount)
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

async function claimRefillCoin(accessToken, clickLevel, proxy) {
    console.log("[CLAIM REFILL COIN]")

    try {
        const response = await fetch(`${apiUrl}/game/recoverCoinPool`, {
            method: 'POST',
            headers: headerWithToken(accessToken),
            agent: proxy
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseJson = await response.json();

        if (responseJson.message === 'Success') {
            console.log("claimRefillCoin:", responseJson.message)
            await collectCoin(accessToken, clickLevel, proxy)
        } else {
            console.log("claimRefillCoin:", responseJson.message)
        }
    } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
}

(async () => {
    process.on('SIGINT', () => {
        console.log('Exiting...');
        process.exit();
    })

    if (!fs.existsSync(sessionPath)) {
        fs.mkdirSync(sessionPath);
    }

    const phone = fs.readFileSync(phonePath, 'utf-8').split(/\r?\n/).map(line => line.replace(/\s/g, '')).filter(line => line !== '');

    // Login Telegram
    for (const number of phone) {
        const sessions = new StoreSession(`${sessionPath}${number}`);
        await register(TelegramClient, sessions, apiId, apiHash, number, input)
    }
    // End Login Telegram
    
    console.log("Clearing Screen ......");
    await sleep(3000)

    // Clear Screen
    clear()

    while (true) {
        let index = 0;
        for (const number of phone) {
            console.log(`\n<=====================[${number}]=====================>`);
            const proxyUrl = `socks5://username:pass@${proxyDomain[index]}:1080`;
            const proxy = new SocksProxyAgent(proxyUrl)
            
            const sessions = new StoreSession(`${sessionPath}${number}`);
            const client = new TelegramClient(sessions, apiId, apiHash, {
                connectionRetries: 5,
            });

            client.setLogLevel("none")

            await client.start({
                phoneNumber: number,
                onError: (err) => console.log(err.message),
            });

            client.setLogLevel("none");

            const auth = await client.invoke(
                new Api.messages.RequestWebView({
                    peer: "theYescoin_bot",
                    bot: "theYescoin_bot",
                    fromBotMenu: false,
                    platform: 'android',
                    url: "https://www.yescoin.gold/",
                })
            );

            const authData = decodeURIComponent(decodeURIComponent(auth.url.split('tgWebAppData=')[1].split('&tgWebAppVersion')[0]));

            const accessToken = await getAccessToken(authData, 3, proxy)

            const [ip, country] = await checkIp(proxy);
            console.log("[CHECK IP]")
            console.log(`Ip\t:${ip}`)
            console.log(`Country\t:${country}`)

            await getAccountInfo(accessToken, proxy)

            const [clickLevel, specialBoxBalance, refillCoinBalance] = await getAccountBuildInfo(accessToken, proxy)

            await collectCoin(accessToken, clickLevel, proxy)

            await getSpecialBox(accessToken, clickLevel, proxy)
            

            for (let i = 0; i < specialBoxBalance; i++) {
                await claimSpecialBox(accessToken, proxy)
            }

            for (let i = 0; i < refillCoinBalance; i++) {
                await claimRefillCoin(accessToken, clickLevel, proxy)
            }

            index++
        }

        const rest = Math.floor(Math.random() * (600000 - 300000 + 1)) + 300000
        console.log(`Rest For ${((rest / 1000) / 60)} Minute`)
        await sleep(rest)
    }
})()