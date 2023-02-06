# Crypto Wallet Problems in the Blockchain Network
### UTXO in BitCoin - (NodeJS, TypeScript)

The fundamental building block of a bitcoin transaction is an unspent transaction output, or UTXO. UTXO are indivisible chunks of bitcoin currency locked to a specific owner, recorded on the blockchain, and recognized as currency units by the entire network. The bitcoin network tracks all available (unspent) UTXO currently numbering in the millions. Whenever a user receives bitcoin, that amount is recorded within the blockchain as a UTXO. Thus, a user’s bitcoin might be scattered as UTXO amongst hundreds of transactions and hundreds of blocks. In effect, there is no such thing as a stored balance of a bitcoin address or account; there are only scattered UTXO, locked to specific owners. The concept of a user’s bitcoin balance is a derived construct created by the wallet application. The wallet calculates the user’s balance by scanning the blockchain and aggregating all UTXO belonging to that user.

A UTXO can have an arbitrary value denominated as a multiple of satoshis. Just like dollars can be divided down to two decimal places as cents, bitcoins can be divided down to eight decimal places as satoshis. Although UTXO can be any arbitrary value, once created it is indivisible just like a coin that cannot be cut in half. If a UTXO is larger than the desired value of a transaction, it must still be consumed in its entirety and change must be generated in the transaction. In other words, if you have a 20 bitcoin UTXO and want to pay 1 bitcoin, your transaction must consume the entire 20 bitcoin UTXO and produce two outputs: one paying 1 bitcoin to your desired recipient and another paying 19 bitcoin in change back to your wallet. As a result, most bitcoin transactions will generate change.

Imagine a shopper buying a $1.50 beverage, reaching into her wallet and trying to find a combination of coins and bank notes to cover the $1.50 cost. The shopper will choose exact change if available (a dollar bill and two quarters), or a combination of smaller denominations (six quarters), or if necessary, a larger unit such as a five dollar bank note. If she hands too much money, say $5, to the shop owner, she will expect $3.50 change, which she will return to her wallet and have available for future transactions.

Similarly, a bitcoin transaction must be created from a user’s UTXO in whatever denominations that user has available. Users cannot cut a UTXO in half any more than they can cut a dollar bill in half and use it as currency. The user’s wallet application will typically select from the user’s available UTXO various units to compose an amount greater than or equal to the desired transaction amount.

As with real life, the bitcoin application can use several strategies to satisfy the purchase amount: combining several smaller units, finding exact change, or using a single unit larger than the transaction value and making change. All of this complex assembly of spendable UTXO is done by the user’s wallet automatically and is invisible to users. It is only relevant if you are programmatically constructing raw transactions from UTXO.

## Goal

Complete missing functionality of endpoint defined in `src/routes/prepare-unspent-outputs.ts`. Endpoint should accept `address` and `amount` query params and return a list of UTXO belonging to the given address that satisfy the purchase amount using the following strategy:

- retrieve unspent outputs for a given address from https://blockchain.info/unspent?active=address,
- sort outputs from smallest to largest and select outputs smaller than target amount starting with smallest outputs until purchase amount is satisfied,
- if purchase amount could not be satisfied using first strategy, select smallest output that is equal or larger than purchase amount,
- on success, returns the list of UTXO that satisfy the purchase amount,
- on failure, returns "Not enough funds" error.

First strategy is akin to trying to get rid of the change in your wallet, while second strategy is fallback strategy when you didn't have enough coins after all and are forced to use banknotes as well.

### Bonus

If you like a challenge you can also implement an additional strategy (strategy 0) that tries to find an exact match from the output list. For example, with a list of outputs 3, 8, 6, 9, 1 and purchase amount of 7 our strategy should return outputs 1 & 6 instead of outputs 1, 3 & 6.

## Examples

First strategy succeeds:

```
GIVEN a list of outputs with 3, 8, 6, 9, 1
AND   a purchase amount of 4
WHEN  a request to /api/prepare-unspent-outputs is made
THEN  outputs with values 1 & 3 should be returned
```

First strategy fails, but second strategy succeeds:

```
GIVEN a list of outputs with 3, 8, 6, 9, 1
AND   a purchase amount of 5
WHEN  a request to /api/prepare-unspent-outputs is made
THEN  output with value 6 should be returned
```

Both strategies fail:

```
GIVEN a list of outputs with 3, 8, 6, 9, 1
AND   a purchase amount of 28
WHEN  a request to /api/prepare-unspent-outputs is made
THEN  'Not enough funds' error should be returned
```

## Testing

You can test your implementation by running the following command:

```
npm run test
```
