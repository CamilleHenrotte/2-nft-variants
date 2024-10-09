# How can OpenSea quickly determine which NFTs an address owns ?

To track the Nfts an address let say Bob has, I would look up at all the Transfer events from any address to Bob an all the Transfer events from Bob to any address. Then if an nft has been tranferred Bob but never transfered from Bob it means Bob still has the nft. I would then need to repeat the operation for all the token contracts that exist in the marketplace.

```javascript
const ethers = require("ethers");
const tokenAddress = "0x...";
const BobAddress = "0x...";

const tokenAbis = [tokenAbi1, tokenAbi2];

function hasToken(tokenAbi) {
  let tokenIdHold = {};
  const provider = new ethers.providers.JsonRpcProvider();
  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);
  const filter1 = tokenContract.filters.Transfer(null, BobAddress);
  const filter2 = tokenContract.filters.Transfer(BobAddress, null);

  tokenContract.queryFilter(filter1).then((events) => {
    events.forEach((event) => {
      const tokenId = event.args.tokenId;

      if (tokenId in tokenIdHold) {
        tokenIdHold[tokenId] += 1;
      } else {
        tokenIdHold[tokenId] = 1;
      }
    });
  });

  tokenContract.queryFilter(filter2).then((events) => {
    events.forEach((event) => {
      const tokenId = event.args.tokenId;

      if (tokenId in tokenIdHold) {
        tokenIdHold[tokenId] -= 1;
      }
      if (tokenIdHold[tokenId] === 0) {
        delete tokenIdHold[tokenId];
      }
    });
  });
}

tokenAbis.forEach((tokenAbi) => {
  hasToken(tokenAbi);
});
```

If I were creating an NFT marketplace, I would use a database and a server that would be constantly listening to events from the tokenAbis. All the events would then keep a database of active nfts and their owners up to date. The marketplace website would then only need to query the data base.
