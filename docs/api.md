<a name="top"></a>
#  v0.0.0



- [Game](#Game)
	- [Retrieve game](#Retrieve-game)
	
- [Prize](#Prize)
	- [Claiming the prize to transfer it to the user](#Claiming-the-prize-to-transfer-it-to-the-user)
	- [Create new prize](#Create-new-prize)
	- [Retrieves the sum of the next prize](#Retrieves-the-sum-of-the-next-prize)
	

# <a name='Game'></a> Game

## <a name='Retrieve-game'></a> Retrieve game
[Back to top](#top)

<p>Retrieves game object</p>

```
GET /games/:gameId
```

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| gameId | `String` | <p>Game's id</p> |


# <a name='Prize'></a> Prize

## <a name='Claiming-the-prize-to-transfer-it-to-the-user'></a> Claiming the prize to transfer it to the user
[Back to top](#top)

<p>Claiming an existing prize, sending it to the user</p>

```
POST /prizes/claim
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JSON Web Token in the format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| winnerId | `String` | <p>external id of the winner, used to identify the prize</p> |
| winnerAccountAddress | `String` | <p>Ethereum account address of the winner, the prize will be send to this address</p> |

### Param Examples
`json` - Request-Example:

```json
{
    "winnerId": "player123",
}
```

## <a name='Create-new-prize'></a> Create new prize
[Back to top](#top)

<p>Creates new prize, but doesn't send it to the user</p>

```
POST /prizes
```
### Headers
| Name    | Type      | Description                          |
|---------|-----------|--------------------------------------|
| Authorization | String | <p>JSON Web Token in the format &quot;Bearer {jwtToken}&quot;</p>|

### Parameter Parameters
| Name     | Type       | Description                           |
|:---------|:-----------|:--------------------------------------|
| winnerId | `String` | <p>external id of the winner, used to identify the user</p> |

### Param Examples
`json` - Request-Example:

```json
{
    "winnerId": "player123",
}
```

## <a name='Retrieves-the-sum-of-the-next-prize'></a> Retrieves the sum of the next prize
[Back to top](#top)



```
GET /prizes/nextPrize
```



