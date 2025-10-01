import { useState } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import Canvas from "@/components/Canvas";
import Toolbar from "@/components/Toolbar";
import { DbConnection, Shape, User } from "./module_bindings";
import "./App.css";

function App() {
  const conn = useSpacetimeDB<DbConnection>();
  const { identity, isActive: connected } = conn;

  const { rows: shapes } = useTable<DbConnection, Shape>("shape");
  const { rows: users } = useTable<DbConnection, User>("user");

  const [selectedTool, setSelectedTool] = useState<
    "rectangle" | "circle" | "select"
  >("select");
  const [selectedColor, setSelectedColor] = useState("#4ecdc4");
  const [userName, setUserNameLocal] = useState("");

  // Show loading state while connecting (after all hooks)
  if (!connected || !identity) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            Connecting to SpacetimeDB...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  const onlineUsers = users.filter((user) => user.online).length;

  const currentUser = users.find((u) => u.identity.isEqual(identity));
  const displayName =
    currentUser?.name || identity.toHexString().substring(0, 8);

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-gray-50">
        <Toolbar
          selectedTool={selectedTool}
          onToolChange={setSelectedTool}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          connected={connected}
          conn={conn}
          userName={displayName}
          onlineUsers={onlineUsers}
          users={Array.from(users)}
        />
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 p-4">
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Real-time Collaborative Canvas
            </h1>
            <p className="text-gray-600">Connected as {displayName}</p>
          </div>

          <div className="flex-1">
            <Canvas
              width={800}
              height={600}
              selectedTool={selectedTool}
              selectedColor={selectedColor}
              shapes={shapes}
              users={users}
              currentUserIdentity={identity}
              conn={conn}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
