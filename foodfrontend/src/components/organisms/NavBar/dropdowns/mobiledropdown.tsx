'use client'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ChevronRight, ArrowLeft, X } from 'lucide-react'
import { useState } from 'react'

type RelatedPackage = {
  name: string
  href: string
  duration?: string
  title?: string
}

type SubLink = {
  name: string
  href: string
  subtitle?: string
  title?: string
  relatedPackages?: RelatedPackage[]
}

type Props = {
  name: string
  href: string
  subLinks?: SubLink[]
  onClickLink?: () => void
}

export default function MobileDropdownMenu({ name, href, subLinks = [], onClickLink }: Props) {
  const [open, setOpen] = useState(false)
  const [activeSubLink, setActiveSubLink] = useState<SubLink | null>(null)

  const isWithRelatedPackages = ['activities', 'destinations'].includes(name.toLowerCase())

  const toggleDropdown = () => {
    setOpen((prev) => !prev)
    if (open) setActiveSubLink(null)
  }

  const handleMainLinkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClickLink) onClickLink()
    setOpen(false)
    setActiveSubLink(null)
  }

  const handleSubLinkClick = (subLink: SubLink) => {
    if (isWithRelatedPackages) {
      setActiveSubLink(subLink)
    } else {
      // Directly navigate for other sections (e.g. About)    
      if (onClickLink) onClickLink()
      setOpen(false)
      setActiveSubLink(null)
      window.location.href = subLink.href
    }
  }

  const handleDirectSubLinkClick = () => {
    if (onClickLink) onClickLink()
    setOpen(false)
    setActiveSubLink(null)
  }

  const handlePackageLinkClick = () => {
    if (onClickLink) onClickLink()
    setOpen(false)
    setActiveSubLink(null)
  }

  const handleBackToSubLinks = () => {
    setActiveSubLink(null)
  }

  const handleCloseDropdown = () => {
    setOpen(false)
    setActiveSubLink(null)
  }

  return (
    <div className="w-full">
      {/* Main Dropdown Toggle */}
      <div className="flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-[#F28A15] hover:text-white rounded-lg transition-colors">
       <Link
  href={href}
  onClick={() => {
    if (onClickLink) onClickLink();
    setOpen(false);
    setActiveSubLink(null);
  }}
  className="cursor-pointer font-medium text-gray-900 hover:text-white flex-1"
>
  {name}
</Link>
        {subLinks.length > 0 && (
          <div onClick={toggleDropdown} className="ml-2">
            {open ? <ChevronUp className="w-5 h-5 text-gray-500 hover:text-white" /> : <ChevronDown className="w-5 h-5 text-gray-500 hover:text-white" />}
          </div>
        )}
      </div>

      {/* Dropdown Menu */}
      {subLinks.length > 0 && open && !activeSubLink && (
        <div className="bg-gray-50 rounded-lg mt-2 overflow-hidden">
          {subLinks.map((sub, index) => (
            <div key={`${sub.name}-${index}`} className="border-b border-gray-200 last:border-b-0">
              <div 
                className="flex items-center justify-between cursor-pointer py-3 px-4 hover:bg-[#F28A15] hover:text-white transition-colors"
                onClick={() => handleSubLinkClick(sub)}
              >
                <span className="text-sm font-medium text-gray-700 hover:text-white">
                  {sub.name || sub.title}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 hover:text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Related Packages View */}
      {isWithRelatedPackages && activeSubLink && (
        <div className="bg-white border border-gray-200 rounded-lg mt-2 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToSubLinks}
                className="p-1 hover:bg-[#F28A15] hover:text-white rounded-full transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600 hover:text-white" />
              </button>
              <span className="text-sm font-medium text-gray-900">
                {activeSubLink.name || activeSubLink.title}
              </span>
            </div>
            <button
              onClick={handleCloseDropdown}
              className="p-1 hover:bg-[#F28A15] hover:text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-600 hover:text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* View All Link */}
            <Link
              href={activeSubLink.href}
              onClick={handleDirectSubLinkClick}
              className="flex items-center justify-between py-3 px-4 bg-[#F28A15] text-white hover:bg-white hover:text-[#F28A15] rounded-lg transition-colors mb-4 group"
            >
              <span className="text-sm font-medium text-white group-hover:text-[#F28A15]">
                View all {activeSubLink.name || activeSubLink.title}
              </span>
              <ChevronRight className="w-4 h-4 text-white group-hover:text-[#F28A15]" />
            </Link>

            {/* Related Packages Section */}
            {activeSubLink.relatedPackages && activeSubLink.relatedPackages.length > 0 ? (
              <div className="space-y-1">
                {activeSubLink.relatedPackages.map((pkg, idx) => (
                  <div key={idx} className="border-b border-gray-100 last:border-b-0">
                    <Link
                      href={pkg.href}
                      onClick={handlePackageLinkClick}
                      className="flex items-center justify-between py-3 px-4 hover:bg-[#F28A15] hover:text-white rounded-lg transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-white">
                          {pkg.name}
                        </h4>
                        {pkg.duration && (
                          <p className="text-xs text-gray-500 mt-1 group-hover:text-white">
                            {pkg.duration}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white flex-shrink-0 ml-2" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  No related packages available
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}