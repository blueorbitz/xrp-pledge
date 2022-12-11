// ** React Imports
import React, { useState, createContext, useContext } from 'react'

// ** MUI Imports
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

//create a context, with createContext api
export const XrplNetworkContext = createContext<any>(null)

export const XrplNetworkProvider = (props: React.ComponentProps<any>) => {
  const [network, setNetwork] = useState<'testnet' | 'devnet' | 'mainnet'>('testnet')

  const getXrplWebsocketUrl = () => {
    let networkUrl: string = ''; // https://xrpl.org/public-servers.html
    switch (network) {
      case 'mainnet': networkUrl = 'wss://s1.ripple.com:51233'; break;
      case 'devnet': networkUrl = 'wss://s.devnet.rippletest.net:51233'; break;
      default: networkUrl = 'wss://s.altnet.rippletest.net:51233';
    }
    return networkUrl
  }

  const getXrplExplorer = (_network = network) => {
    let explorerUrl: string = '';
    switch (_network) {
      case 'mainnet': explorerUrl = 'https://livenet.xrpl.org'; break;
      case 'devnet': explorerUrl = 'https://devnet.xrpl.org'; break;
      default: explorerUrl = 'https://testnet.xrpl.org';
    }
    return explorerUrl
  }

  return (
    <XrplNetworkContext.Provider value={{
      getXrplWebsocketUrl,
      getXrplExplorer,
      network, setNetwork,
    }}>
      {props.children}
    </XrplNetworkContext.Provider>
  );
};

const useXrplNetwork = () => useContext(XrplNetworkContext)
export default useXrplNetwork

export function NetworkSelector() {
  const { network, setNetwork } = useXrplNetwork()

  return (
    <FormControl>
      <Select
        // defaultValue='testnet'
        size='small'
        value={network}
        onChange={e => setNetwork(e.target.value)}
      >
        <MenuItem value='testnet'>Testnet</MenuItem>
        <MenuItem value='mainnet'>Mainnet</MenuItem>
      </Select>
    </FormControl>
  )
}
