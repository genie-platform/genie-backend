
# Bootstrapping your game

After the server running you need to set up your game and the funding account.
For now the process is rather manual.

- Creating the game in the db. 
  Call the endpoint POST /api/v1/game. For example with `curl`
  
  ```
  curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"My great tournament"}' \
  http://localhost:3000/api/v1/game
  ```

  This will return a game object with account address in it (this account will controll your game funding), and a JWT that gives access to game management.

- Fund the account address with Ether so it cand pay for the transactions gas.

- I think you also need to approve DAI for the cDai contract
