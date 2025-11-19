import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import ImageDisplay from '@/app/ui/imageDisplay'
import { VitrineItem } from '@/types/vitrine-items'
import { formatImageSrc } from '@/lib/utils'

interface BaseItemCardProps {
  item: VitrineItem
  currentUser: string
  userDisplayNames: Record<string, string>
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  renderDetails: (item: VitrineItem) => JSX.Element
}

export default function BaseItemCard({
  item,
  currentUser,
  userDisplayNames,
  onEdit,
  onDelete,
  renderDetails,
}: BaseItemCardProps) {
  const [selectedItem, setSelectedItem] = useState<VitrineItem | null>(null)

  const handleEdit = () => {
    if (selectedItem) {
      onEdit(selectedItem._id)
    }
  }

  const handleDelete = () => {
    if (selectedItem) {
      onDelete(selectedItem._id)
    }
  }

  return (
    <Card className="flex flex-col h-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-lg">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <ImageDisplay
          image={item.logo}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
        <CardDescription className="flex-grow">
          {item.description}
        </CardDescription>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.map((tag, tagIndex) => (
            <Badge key={tagIndex} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                typeof item.logo === 'string' ? formatImageSrc(item.logo) : ''
              }
              alt={item.responsibleUser}
            />
            <AvatarFallback>
              {userDisplayNames[item.responsibleUser]
                ? userDisplayNames[item.responsibleUser]
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                : item.responsibleUser
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">
            {userDisplayNames[item.responsibleUser] || item.responsibleUser}
          </span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={() => setSelectedItem(item)}>
              Detalhes
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedItem.title}</DialogTitle>
                  <DialogDescription>{selectedItem.type}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <ImageDisplay
                    image={item.logo ?? undefined} // Converte null para undefined
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <p>{selectedItem.description}</p>
                  </ScrollArea>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Separator />
                  {renderDetails(selectedItem)}
                  {selectedItem.creatorId === currentUser && (
                    <div className="flex justify-between mt-4">
                      <Button variant="outline" onClick={handleEdit}>
                        Editar
                      </Button>
                      <Button variant="outline" onClick={handleDelete}>
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}
