import Image from 'next/image'
import React from 'react'

const GuaranteeInfo = () => {
  return (
    <div className="flex text-primary flex-col px-10">
            <div className='max-h-64 max-w-64'>
            <Image height={400} width={400} src={"/fastmoney.png"} alt='security' />
            </div>
            <div className='max-w-3xl'>
                <h3 className="text-xl md:text-4xl  font-semibold  mb-4">
                72-Hour Guarantee
                </h3>
                <p className="text-base md:text-xl font-sans font-light">
                Jika brand happy atau tidak action, payment otomatis released. No delay.
                </p>
            </div>
        </div>
  )
}

export default GuaranteeInfo
