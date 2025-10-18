import Image from 'next/image'
import React from 'react'

const DepositInfo = () => {
    return (
        <div className="flex flex-col text-primary px-10">
            <div className='max-h-64 max-w-64'>
            <Image height={400} width={400} src={"/Handshake.png"} alt='security' />
            </div>
            <div className='max-w-3xl'>
                <h3 className="text-xl md:text-4xl font-semibold  mb-4">
                    Brand Deposit First
                </h3>
                <p className="text-base md:text-xl font-sans font-light">
                    Dana dikunci di smart contract. Brand tidak bisa cancel sepihak.
                    Creator yakin akan dibayar.
                </p>
            </div>
        </div>
    )
}

export default DepositInfo
