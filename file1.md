# ERC721A

ERC721A is an implementation of the ERC721 standard for non-fungible tokens (NFTs) that is designed to optimize gas usage. Here are some key feature

---

### Removing duplicate storage

As with ERC721A, the tokens are serially numbered starting from 0 there is no more need to track all the tokenIDs in existence. In ERC721 Enumerables, two storage variables \_allTokens and \_allTokensIndex are used to keep account on all tokens Id in existence.Thes are now useless in ERC721.
**gas reduction**: removing the storage cost of keeping all of the token id with \_allTokens and \_allTokensIndex storage varilabes.
**gas increase**: ERC721A does not provide an efficient way to look up all the token id of an address. So if you had to look it up on chain, you would have to loop over all the token ids. This would be much moregas expensive as the method developped in ERC721A that fix this particular issue

---

### Updating the owner’s balance once per batch mint request

ERC721A introduces batchMint, which optimises minting for multiple tokens. The standard way in ERC721 would be to call multiple time the mint function which updates the balance each time. Batch minting enbles to do the same in a single update.
**gas reduction**: removing the gas cost of minting multiple tokens for a single address.

---

### Updating the owner data once per batch mint request

When minting multiple tokens consecutively, instead of saving the owner for each token, the contract stores the owner for the first token in the batch. For subsequent tokens in the batch, ownership is implied until a new owner is encountered.
**gas reduction**: This approach reduces the number of storage writes, which are gas-expensive. By not writing the owner for every token, you eliminate redundant updates.
**gas increase**: If someone owns many tokens, determining ownership may require more steps (reading past tokens) when checking for ownership of non-explicitly set tokens.
