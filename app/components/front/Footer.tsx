'use client'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { data: session } = useSession()
  
  const footerLinks = [
    ...(session?.user?.role !== 'admin' ? [{ name: 'Home', href: '/list/home' }] : []),
    { name: 'Services', href: '/list/services' },
    ...(session?.user?.role !== 'user' ? [{ name: 'Users', href: '/list/users' }] : []),
    { name: 'Privacy Policy', href: 'https://www.termsfeed.com/live/403a22ed-be22-480a-996b-43a41d4c00a9' },
    ...(session?.user?.role !== 'admin' ? [{ name: 'Contact', href: '/list/contacts' }] : []),
  ]

  return (
    <footer className="relative bg-mainColor mt-auto">
      <div className="absolute top-0 w-full h-full" 
        style={{ 
          background: "linear-gradient(268.24deg, rgba(128, 0, 128, 0.76) 50%, rgba(186, 85, 211, 0.545528) 80.61%, rgba(75, 0, 130, 0) 117.35%)" 
        }}
      />
      <div className="relative z-10 mx-auto max-w-screen-xl px-4 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <span className="text-sm text-white sm:text-center">
            © {currentYear} <Link href="/" className="hover:underline">PetCare™</Link>. All Rights Reserved.
          </span>
          <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-white/90 sm:mt-0">
            {footerLinks.map((link, index) => (
              <li key={index}>
                {link.href.startsWith('http') ? (
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hover:text-white transition-colors ${
                      index < footerLinks.length - 1 ? 'mr-6' : ''
                    }`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link 
                    href={link.href}
                    className={`hover:text-white transition-colors ${
                      index < footerLinks.length - 1 ? 'mr-6' : ''
                    }`}
                  >
                    {link.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}