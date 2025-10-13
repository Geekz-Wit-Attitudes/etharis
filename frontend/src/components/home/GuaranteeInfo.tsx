import Image from 'next/image'
import React from 'react'

const GuaranteeInfo = () => {
  return (
    <div className="flex justify-evenly text-primary">
            <div className='max-w-3xl py-20'>
                <h3 className="text-7xl font-semibold  mb-4">
                72-Hour Guarantee
                </h3>
                <p className="text-3xl font-sans font-light">
                Jika brand happy atau tidak action, payment otomatis released. No delay.
                </p>
            </div>
            <div className=''>
            <Image height={400} width={400} src={"/fastmoney.png"} alt='security' />
            </div>
        </div>
  )
}

export default GuaranteeInfo
