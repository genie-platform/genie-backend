- Start a mongo server or get an access to one
- First clone the project and install dependencies
  ```
  git clone https://github.com/leonprou/genie.git
  cd gennie
  npm install
  ```
- Some environment variables are needed to be defined.
 ```
 export GENNIE_PROVIDER="ethereum provider for the Kovan network here"
 # Just Kovan is supported for now hence the contracts addresses are hardcoded

 export GENNIE_SECRETS_ACCOUNTS_MNEMONIC="mnemonic seed"
 # Users accounts are generated from the seed, this seed controlls all the funds.
 ```
 - Start the server with `npm start`