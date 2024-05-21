async function register(TelegramClient, sessions, apiId, apiHash, phone, input) {
    console.log("Loading...");
    const client = new TelegramClient(sessions, apiId, apiHash, {
        connectionRetries: 5,
    });
    
    client.setLogLevel("none");

    await client.start({
        phoneNumber: phone,
        password: async () => await input.text("password?"),
        phoneCode: async () => await input.text("Code ?"),
        onError: (err) => console.log(err),
    });


    console.log(`Login Telegram ${phone} Successfully`);
}

module.exports = register;