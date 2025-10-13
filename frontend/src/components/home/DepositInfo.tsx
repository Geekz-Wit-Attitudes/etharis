import Image from 'next/image'
import React from 'react'

const DepositInfo = () => {
    return (
        <div className="flex justify-evenly text-primary">
            <div className='max-w-3xl py-20'>
                <h3 className="text-7xl font-semibold  mb-4">
                    Brand Deposit First
                </h3>
                <p className="text-3xl font-sans font-light">
                    Dana dikunci di smart contract. Brand tidak bisa cancel sepihak.
                    Creator yakin akan dibayar.
                </p>
            </div>
            <div className=''>
            <Image height={400} width={400} src={"/shield.png"} alt='security' />
            </div>
        </div>
    )
}

export default DepositInfo
