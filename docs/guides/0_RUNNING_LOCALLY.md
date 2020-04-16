# Running locally

1. Start a [mongoDB server locally](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) or get an access to a remote one. Will be used when bootstrapping a game.
2. First clone the project and install dependencies
    ```
    git clone https://github.com/leonprou/genie.git
    cd genie
    npm install
    ```
3. Some environment variables are needed to be defined.
    ```
    export GENIE_PROVIDER="ethereum provider for the Kovan network here"
    # Just Kovan testnet is supported for now hence the contracts addresses are hardcoded

    export GENIE_SECRETS_ACCOUNTS_MNEMONIC="mnemonic seed"
    # Users accounts are generated from the seed, this seed controlls all the funds.
    ```
 4. Start the server with `npm start`