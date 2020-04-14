
# Bootstrapping your game

After the server running you need to set up your game and the funding account.
For now the process is rather manual.

1. Creating the game in the db.
  Call the endpoint POST /api/v1/game. For example with `curl`:

  ```
  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"My great tournament"}' \
  http://localhost:3000/api/v1/games
  ```

  This will return a game object with account address in it (this account will control your game funding), and a JWT that gives access to game management.

2. Fund the account address with Ether so it cand pay for the transactions gas.

3. Fund the account address with DAI so it can be invested

4. Invest the DAI in the compound protocol.
  Call the enpoint POST /api/v1/funding/invest to invest all accounts DAI balance. with `curl`:

    ```
  curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer [your jwt token]" \
  --request POST \
  http://localhost:3000/api/v1/funding/invest
  ```
