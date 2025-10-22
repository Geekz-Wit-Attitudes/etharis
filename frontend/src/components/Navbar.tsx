'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Handshake, User, LogOut, LoaderIcon } from 'lucide-react'
import { useEtharisStore } from '@/lib/store' // Import Zustand store
import { useLogout } from '@/hooks/useAuth' // Import hook logout
import Image from 'next/image'

export const Navbar = () => {
    const router = useRouter();
    const { isAuthenticated, user, logout } = useEtharisStore(); // Ambil state dan action dari store
    const { mutate: logoutMutate, isPending: isLoggingOut } = useLogout(); // Gunakan hook logout

    const handleLogin = () => {
        router.push('/auth/login');
    }

    const handleProfile = () => {
        router.push('/profile');
    }

    const handleLogout = () => {
        logoutMutate();
    }

    console.log(user?.role);
    

    // Tentukan path dashboard berdasarkan role
    const dashboardPath = user?.role === 'brand' ? '/dashboard' : '/creator';

    return (
        <nav className="sticky top-0 w-full z-10 border-b-4 border-[var(--color-primary)] bg-[var(--color-light)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link href={dashboardPath} className="flex items-center justify-center gap-2">
                        {/* Logo ETHARIS dengan gaya Neo-Brutalism Block */}
                        <div className="w-full h-full flex items-center justify-center">
                            <Image src={'/etharis-logo.png'} width={500} height={500} alt='logo' className="w-10 h-10" />
                        </div>
                        <span className="text-2xl font-extrabold text-[var(--color-primary)] tracking-tight">ETHARIS</span>
                    </Link>

                    {/* Logika Kondisional untuk Status Autentikasi */}
                    {!isAuthenticated ? (
                        <button
                            onClick={handleLogin}
                            className="
                                bg-[var(--color-secondary)] text-[var(--color-primary)] font-bold 
                                py-1 px-4 rounded-none border-2 border-[var(--color-primary)] 
                                transition-colors duration-150 hover:bg-transparent hover:shadow-none
                                shadow-[2px_2px_0px_0px_var(--color-primary)]
                                hover:translate-x-[2px] hover:translate-y-[2px] text-sm
                            "
                        >
                            LOGIN
                        </button>
                    ) : (
                        <div className="flex items-center space-x-3 h-[5vh]">
                            {/* Tombol Profile */}
                            <button
                                onClick={handleProfile}
                                className="
                                    btn-small-secondary h-full flex items-center gap-1 font-sans
                                    !py-1 !px-3 !border-2 !text-sm
                                "
                            >
                                <User className="w-4 h-4" />
                                {user?.name.split(' ')[0] || 'Profile'}
                            </button>

                            {/* Tombol Logout */}
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="
                                    h-full btn-small flex items-center gap-1 font-sans bg-transparent hover:bg-red-600 border-red-700 text-red-600 hover:text-white
                                    !py-1 !px-3 !border-2 !text-sm
                                "
                            >
                                {isLoggingOut ? (
                                    <LoaderIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                    <LogOut className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
