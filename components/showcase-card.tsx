import { Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inter } from 'next/font/google'

interface ShowcaseItem {
  icon: string
  text: string
}

interface ShowcaseCardProps {
  title: string
  description: string
  items: ShowcaseItem[]
  comingSoon?: boolean
}

const inter = Inter({
  subsets: ['latin'],
  weight: ['200', '400', '500', '600', '700', '800', '900'],
})

export default function ShowcaseCard({
  title,
  description,
  items,
  comingSoon = false,
}: ShowcaseCardProps) {
  return (
    <Card
      className="p-4 max-w-md relative overflow-hidden"
      style={{ backgroundColor: 'rgba(242, 249, 249, 0.35)' }}
    >
      {comingSoon && (
        <div className="absolute top-0 right-0 bg-[#325158] text-white px-3 py-1 rounded-bl-md text-sm font-semibold">
          Em breve
        </div>
      )}
      <CardHeader className="space-y-4 pb-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#DDEFF0]">
          <Mail className="h-6 w-6 text-[#325158]" />
        </div>
        <CardTitle
          style={{ fontWeight: 600, fontSize: '1.6rem', color: '#1A2C32' }}
          className={inter.className}
        >
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-[#475467]">
        <p className={inter.className} style={{ maxWidth: 400 }}>
          {description}
        </p>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#DDEFF0]">
                <span className="text-[#325158]">{item.icon}</span>
              </div>
              <span style={{ maxWidth: 350 }} className={inter.className}>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
