# Running locally

1. Start a [mongoDB server locally](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/) or get an access to a remote one. Will be used when bootstrapping a game.
2. First clone the project and install dependencies
    ```
    git clone https://github.com/leonprou/genie.git
    cd genie
    npm install
    ```
3. There's some environment variables needed to be defined:

    `GENIE_PROVIDER` sets the ethereum provider used to interact with the Ethereum network, you can connect to a running node or use a service like [Infura](https://infura.io/).
    
    `GENIE_SECRETS_ACCOUNTS_MNEMONIC` sets the mnemonic that gonna be used for backend accounts of genie. The backend accounts are the operators of genie, they are responsible to send rewards and manage the funding. You can create a mnemonic seed [here](https://iancoleman.io/bip39/).
    ```
    export GENIE_PROVIDER="https://kovan.infura.io/v3/[projectId]"
    # Just Kovan testnet is supported for now hence the contracts addresses are hardcoded

    export GENIE_SECRETS_ACCOUNTS_MNEMONIC="mnemonic seed"
    ```
 4. Start the server with `npm start`
