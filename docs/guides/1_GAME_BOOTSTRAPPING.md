# Bootstrapping your game

After the server running you need to set up your game and the funding account.
For now the process is rather manual.


## Prerequisites
Define the $GENIE_API_URL environment variable in your shell. Running Genie locally the url is usually http://localhost:3000, while the hosted version is on https://api.thegenie.xyz/. 
For example to define it for local development:
```
export GENIE_API_URL=http://localhost:3000
```

## Steps

1. Creating the game in the db.
   Call the endpoint POST /api/v1/game. For example with `curl`:

   ```
   curl --header "Content-Type: application/json" \
   --request POST \
   --data '{"name":"My great tournament"}' \
   $GENIE_API_URL/api/v1/games
   ```

   This will return a game object with account address in it (this account will control your game funding), and a JWT that gives access to game management.

   Example of a game object with address, and JWT value:

   ```json
   data: {
     "game":{
       "fund":"0",
       "_id":"5e985f796e1233246cf18d95",
       "name":"LastSurvivor01",
       "accountAddress":"0x9a73d40d2829521...",
       ...
     },
     "jwtToken":"eyJhbGciOiJIUzI..."
   }
   ```
   As we defined the `GENIE_API_URL` variable, you may also define the JWT as an environment variable:

   ```
   export MY_GAME_JWT='eyJhbGciOiJIUzI...'
   ```

2. Fund the account address you recieved with Ether so it cand pay for the transactions gas. You can [get Kovan ether here.](https://faucet.kovan.network/)

3. Fund the account address you recieved with DAI so it can be invested. You can [get Kovan DAI here.](https://oasis.app/trade/instant)

4. Invest the DAI in the compound protocol:

   Call the enpoint POST /api/v1/funding/invest to invest all accounts DAI balance. with `curl`:

   ```
   curl --header "Content-Type: application/json" \
   --header "Authorization: Bearer $MY_GAME_JWT" \
   --request POST \
   $GENIE_API_URL/api/v1/funding/invest
   ```
