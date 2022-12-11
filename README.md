# XRP Pledge

Pledge support for any using XRP's NFT as proof of pledge.

# Get Started

1. Clone the code
1. `yarn install`
1. copy `.env.sample` to `.env.development.local`
1. Sign up for [Xumm Developer](https://apps.xumm.dev)
1. Get the API KEY
1. Sign up for [MongoDB](https://cloud.mongodb.com/)
1. Create a DB can collection for ENV later.
1. Sign up for [Cloudinary](https://console.cloudinary.com/console/)
1. Get the API KEY
1. Create an [Testnet Faucet](https://xrpl.org/xrp-testnet-faucet.html) for broker account.
1. Fill in the needed enviroment variable.
1. `yarn dev` - to start in dev mode

# How it works
1. User will create a Pledge for listing. Stating the amount of NFT offering and Min Price.
1. App will help the user to Mint and CreateBuyOffer, by assiging us as Broker for future transactions.
1. User that browse for pledge, can choose to pledge if there is available tokens.
1. User is required to use Xumm to sign for the payment of the NFT.
1. Summary can by view on the Single Page.

# Improvement
- Convert Cloudinary to IPFS storage.
- Search for Pledge.
- Delete Pledge that is created by the creator.
- Error Handling for external request.
