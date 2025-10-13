import Image from 'next/image'
import React from 'react'

const AutomateInfo = () => {
    return (
        <div className="flex justify-evenly text-primary">
            <div className=''>
            <Image height={400} width={400} src={"/automate.png"} alt='automate' />
            </div>
            <div className='max-w-3xl py-20'>
                <h3 className="text-7xl font-semibold  mb-4 ">
                Auto Verification
                </h3>
                <p className="text-3xl font-sans font-light">
                System cek otomatis: konten live? on-time? Brand punya 72 jam untuk review.
                </p>
            </div>
        </div>
    )
}

export default AutomateInfo
