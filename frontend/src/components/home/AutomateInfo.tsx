import Image from 'next/image'
import React from 'react'

const AutomateInfo = () => {
    return (
        <div className="flex text-primary flex-col px-10">
            <div className='max-h-64 max-w-64'>
            <Image height={400} width={400} src={"/automate.png"} alt='automate' />
            </div>
            <div className='max-w-3xl'>
                <h3 className="text-xl md:text-4xl font-semibold  mb-4">
                Auto Verification
                </h3>
                <p className="text-base md:text-xl font-sans font-light">
                System cek otomatis: konten live? on-time? Brand punya 72 jam untuk review.
                </p>
            </div>
        </div>
    )
}

export default AutomateInfo
