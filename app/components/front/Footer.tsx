'use client'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = [
    { name: 'About', href: '/home' },
    { name: 'Services', href: '/list/services' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Contact', href: '/contact' },
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
                <Link 
                  href={link.href}
                  className={`hover:text-white transition-colors ${
                    index < footerLinks.length - 1 ? 'mr-6' : ''
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}