'use client'

import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'

export function ConnectButton({isDisplay} : {isDisplay?: boolean}) {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted
        const connected = ready && account && chain

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} className="btn-primary">
                    Connect Wallet
                  </button>
                )
              }

              if (isDisplay) {
                return <></>
              }

              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} className="btn-secondary">
                    Wrong network
                  </button>
                )
              }

              return (
                <div className="flex gap-2 items-center justify-center">
                  <button
                    onClick={openChainModal}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 16,
                          height: 16,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button onClick={openAccountModal} className="btn-primary">
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}
