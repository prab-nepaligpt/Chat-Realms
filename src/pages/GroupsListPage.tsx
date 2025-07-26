import { useNavigate } from "react-router-dom";
import { User, Plus, UserPlus, Search, Check } from "lucide-react";
import { GroupCard } from "../Components/GroupCard";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const initialGroups = [
  { id: "1", name: "Tech Enthusiasts", lastMessage: "Just pushed the new update!", avatar: "🚀" },
  { id: "2", name: "Gamers World", lastMessage: "Anyone up for a match tonight?", avatar: "🎮" },
  { id: "3", name: "Book Club", lastMessage: "What did you think of the last chapter?", avatar: "📚" },
  { id: "4", name: "Design Team", lastMessage: "Here's the new mockup.", avatar: "🎨" },
];

const testUsers = [
  { id: 'u1', name: 'Sudhir', avatar: '👩‍💻' },
  { id: 'u2', name: 'Aadish', avatar: '👨‍🚀' },
  { id: 'u3', name: 'Amit', avatar: '🧑‍🎨' },
  { id: 'u4', name: 'Ram', avatar: '🦸‍♀️' },
];

export const GroupsListPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [groups, setGroups] = useState(initialGroups);
  const [showAdd, setShowAdd] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState("💬");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequests, setFriendRequests] = useState<Record<string, 'sent'>>({});
  const [notification, setNotification] = useState<{ user: { id: string; name: string } | null; timeoutId: NodeJS.Timeout | null }>({ user: null, timeoutId: null });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSendRequest = (user: { id: string; name: string }) => {
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }

    setFriendRequests(prev => ({ ...prev, [user.id]: 'sent' }));

    const timeoutId = setTimeout(() => {
      setNotification({ user: null, timeoutId: null });
    }, 5000);

    setNotification({ user, timeoutId });
  };

  const handleUndoRequest = (userId: string) => {
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId);
    }
    setFriendRequests(prev => {
      const newState = { ...prev };
      delete newState[userId];
      return newState;
    });
    setNotification({ user: null, timeoutId: null });
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
          className="text-sm bg-gray-700 hover:bg-red-600 text-gray-300 hover:text-white font-semibold py-1 px-3 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Groups</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddFriend(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
            >
              <UserPlus size={18} />
              <span>Add Friend</span>
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors"
            >
              <Plus size={18} />
              <span>Add Group</span>
            </button>
          </div>
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

      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddFriend(false)}>
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Find Friends</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by username..."
                className="w-full p-2 pl-10 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testUsers
                .filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{user.avatar}</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <button 
                      onClick={() => handleSendRequest(user)}
                      disabled={!!friendRequests[user.id]}
                      className="p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {friendRequests[user.id] ? (
                        <Check size={20} className="text-green-400" />
                      ) : (
                        <Plus size={20} className="text-green-400 hover:text-green-300" />
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {notification.user && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-700 text-white py-2 px-4 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-up z-[60]">
          <span>Friend request sent to <strong>{notification.user.name}</strong></span>
          <button
            onClick={() => handleUndoRequest(notification.user!.id)}
            className="font-bold text-blue-400 hover:text-blue-300"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}; 