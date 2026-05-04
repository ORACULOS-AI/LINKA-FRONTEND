import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

interface BusinessManagementRefreshProps {
  handleRefreshButtonClick: () => void
}

export function BusinessManagementRefresh({
  handleRefreshButtonClick,
}: BusinessManagementRefreshProps) {
  return (
    <Button variant="outline" size="icon" onClick={handleRefreshButtonClick}>
      <RefreshCw className="h-4 w-4" />
    </Button>
  )
}
