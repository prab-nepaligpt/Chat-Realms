import { useNavigate } from "react-router-dom";
import { LogOut, User, Plus } from "lucide-react";
import { GroupCard } from "../Components/GroupCard";
import { useState } from "react";

const initialGroups = [
  { id: "1", name: "Tech Enthusiasts", lastMessage: "Just pushed the new update!", avatar: "🚀" },
  { id: "2", name: "Gamers World", lastMessage: "Anyone up for a match tonight?", avatar: "🎮" },
  { id: "3", name: "Book Club", lastMessage: "What did you think of the last chapter?", avatar: "📚" },
  { id: "4", name: "Design Team", lastMessage: "Here's the new mockup.", avatar: "🎨" },
];

export const GroupsListPage = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState(initialGroups);
  const [showAdd, setShowAdd] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState("💬");

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/login");
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    setGroups([
      ...groups,
      {
        id: Date.now().toString(),
        name: newGroupName,
        lastMessage: "",
        avatar: newGroupAvatar || "💬",
      },
    ]);
    setShowAdd(false);
    setNewGroupName("");
    setNewGroupAvatar("💬");
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <User size={20} className="text-blue-400" />
          <span className="font-semibold">Demo User</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Groups</h1>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
          >
            <Plus size={18} />
            <span>Add Group</span>
          </button>
        </div>

        {/* Add Group Modal/Form */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Create New Group</h2>
              <div className="mb-4">
                <label className="block text-sm mb-1">Group Name</label>
                <input
                  className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  maxLength={32}
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1">Group Avatar (emoji)</label>
                <input
                  className="w-16 p-2 rounded bg-gray-700 text-2xl text-center focus:outline-none"
                  value={newGroupAvatar}
                  onChange={e => setNewGroupAvatar(e.target.value)}
                  maxLength={2}
                  placeholder="💬"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGroup}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  disabled={!newGroupName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} onClick={handleGroupClick} />
          ))}
        </div>
      </main>
    </div>
  );
}; 