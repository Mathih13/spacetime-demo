import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MousePointer, Square, Circle } from 'lucide-react'
import { User, DbConnection } from '@/module_bindings'

interface ToolbarProps {
  selectedTool: 'rectangle' | 'circle' | 'select'
  onToolChange: (tool: 'rectangle' | 'circle' | 'select') => void
  selectedColor: string
  onColorChange: (color: string) => void
  connected: boolean
  conn: DbConnection
  userName: string
  onlineUsers: number
  users: User[]
}

const colors = [
  '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1',
  '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'
]

export default function Toolbar({
  selectedTool,
  onToolChange,
  selectedColor,
  onColorChange,
  connected,
  conn,
  userName,
  onlineUsers,
  users,
}: ToolbarProps) {
  return (
    <Card className="w-64 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Canvas Tools
          <Badge variant={connected ? "default" : "destructive"}>
            {connected ? "Connected" : "Disconnected"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Name</label>
          <Input
            key={userName}
            defaultValue={userName}
            onBlur={(e) => conn.reducers.setUserName(e.target.value)}
            placeholder="Enter your name"
            className="w-full"
          />
        </div>

        <Separator />

        {/* Tools */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tools</label>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant={selectedTool === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('select')}
              className="aspect-square p-2"
            >
              <MousePointer size={16} />
            </Button>
            <Button
              variant={selectedTool === 'rectangle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('rectangle')}
              className="aspect-square p-2"
            >
              <Square size={16} />
            </Button>
            <Button
              variant={selectedTool === 'circle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('circle')}
              className="aspect-square p-2"
            >
              <Circle size={16} />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Colors */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Colors</label>
          <div className="grid grid-cols-4 gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`w-8 h-8 rounded border-2 ${
                  selectedColor === color
                    ? 'border-gray-800'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <Separator />

        {/* Online Users */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Online Users</label>
          <Badge variant="secondary" className="w-full justify-center">
            {onlineUsers} user{onlineUsers !== 1 ? 's' : ''} online
          </Badge>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {users
              .filter(user => user.online)
              .map((user) => (
                <div
                  key={user.identity.toHexString()}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  <span className="truncate">
                    {user.name || user.identity.toHexString().substring(0, 8)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}