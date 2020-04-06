# Integrating Genie in your game flow

After the bootsraping you can start integrate Genie in your game flow.
Let's say the you're build a tournaments game, every week there's a tournament and the winner takes the weeks's accrued interest. 

# Show the tournaments reward to your users
call GET /api/v1/prizes/nextPrize

# Notify Genie about the winner
After the tournament is done and the winner is decided, notify Genie about it. Genie needs to know that this prize is ready for distribuition closed, so the interest from now going to be accrued for the new winner.


# Send the reward to the winner
Providing the ethereum address, Genie can send the winner his reward.