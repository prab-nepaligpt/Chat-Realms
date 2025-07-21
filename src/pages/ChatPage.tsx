import { useParams } from "react-router-dom";
import { useState } from "react";
import { Send, LogOut, User, MessageCircle, ArrowLeft, Settings as SettingsIcon, ChevronLeft } from "lucide-react";

const emotionalBots = [
  { id: 'anger', name: 'Anger', emoji: '😡' },
  { id: 'joy', name: 'Joy', emoji: '😃' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'fear', name: 'Fear', emoji: '😱' },
  { id: 'surprise', name: 'Surprise', emoji: '😲' },
  { id: 'disgust', name: 'Disgust', emoji: '🤢' },
  { id: 'trust', name: 'Trust', emoji: '🤝' },
  { id: 'anticipation', name: 'Anticipation', emoji: '🤔' },
  { id: 'love', name: 'Love', emoji: '😍' },
  { id: 'boredom', name: 'Boredom', emoji: '🥱' },
  { id: 'shame', name: 'Shame', emoji: '😳' },
  { id: 'pride', name: 'Pride', emoji: '😌' },
];

const mockMembers = [
  { id: '1', name: 'Demo User', isAdmin: true },
  { id: '2', name: 'Alice', isAdmin: false },
  { id: '3', name: 'Bob', isAdmin: false },
];

export const ChatPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: `Welcome to group ${groupId}! 👋`, sender: "system", timestamp: new Date() },
    { id: 2, text: "Start chatting with your friends!", sender: "system", timestamp: new Date() }
  ]);
  const [showSettings, setShowSettings] = useState(false);
  const [groupName, setGroupName] = useState(`Group ${groupId}`);
  const [groupDesc, setGroupDesc] = useState("This is a group description.");
  const [enabledBots, setEnabledBots] = useState<{ [id: string]: boolean }>(() => {
    const obj: { [id: string]: boolean } = {};
    emotionalBots.forEach(bot => { obj[bot.id] = true; });
    return obj;
  });
  const [activeSection, setActiveSection] = useState<null | 'name' | 'desc' | 'members' | 'bots'>(null);

  const isAdmin = true; // For demo, assume user is admin

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date()
    };
    setMessages([...messages, newMessage]);
    setMessage("");
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: "Thanks for your message! This is a demo response.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleLogout = () => {
    window.location.href = "/login";
  };

  const toggleBot = (botId: string) => {
    setEnabledBots(prev => ({ ...prev, [botId]: !prev[botId] }));
  };

  // Settings modal content logic
  const renderSettingsContent = () => {
    if (!activeSection) {
      return (
        <div className="space-y-4">
          <button
            className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded text-left"
            onClick={() => setActiveSection('name')}
          >
            <span>Change Group Name</span>
            <ChevronLeft className="rotate-180" size={18} />
          </button>
          <button
            className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded text-left"
            onClick={() => setActiveSection('desc')}
          >
            <span>Change Description</span>
            <ChevronLeft className="rotate-180" size={18} />
          </button>
          <button
            className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded text-left"
            onClick={() => setActiveSection('members')}
          >
            <span>See Members</span>
            <ChevronLeft className="rotate-180" size={18} />
          </button>
          <button
            className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded text-left"
            onClick={() => setActiveSection('bots')}
          >
            <span>Manage Bots</span>
            <ChevronLeft className="rotate-180" size={18} />
          </button>
        </div>
      );
    }
    if (activeSection === 'name') {
      return (
        <div>
          <button className="mb-4 flex items-center text-gray-400 hover:text-blue-400" onClick={() => setActiveSection(null)}>
            <ChevronLeft size={20} /> <span className="ml-1">Back</span>
          </button>
          <label className="block text-sm mb-1">Group Name</label>
          <input
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            value={groupName}
            onChange={e => setGroupName(e.target.value)}
            disabled={!isAdmin}
          />
        </div>
      );
    }
    if (activeSection === 'desc') {
      return (
        <div>
          <button className="mb-4 flex items-center text-gray-400 hover:text-blue-400" onClick={() => setActiveSection(null)}>
            <ChevronLeft size={20} /> <span className="ml-1">Back</span>
          </button>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none"
            value={groupDesc}
            onChange={e => setGroupDesc(e.target.value)}
            disabled={!isAdmin}
          />
        </div>
      );
    }
    if (activeSection === 'members') {
      return (
        <div>
          <button className="mb-4 flex items-center text-gray-400 hover:text-blue-400" onClick={() => setActiveSection(null)}>
            <ChevronLeft size={20} /> <span className="ml-1">Back</span>
          </button>
          <label className="block text-sm mb-1">Members</label>
          <ul className="bg-gray-700 rounded p-2">
            {mockMembers.map(member => (
              <li key={member.id} className="flex items-center space-x-2 py-1">
                <User size={16} />
                <span>{member.name}</span>
                {member.isAdmin && <span className="text-xs text-blue-400 ml-2">(admin)</span>}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (activeSection === 'bots') {
      return (
        <div>
          <button className="mb-4 flex items-center text-gray-400 hover:text-blue-400" onClick={() => setActiveSection(null)}>
            <ChevronLeft size={20} /> <span className="ml-1">Back</span>
          </button>
          <label className="block text-sm mb-1">Manage Bots</label>
          <div className="grid grid-cols-2 gap-2">
            {emotionalBots.map(bot => (
              <div key={bot.id} className="flex items-center space-x-2 bg-gray-700 rounded p-2">
                <span className="text-2xl">{bot.emoji}</span>
                <span className="flex-1">{bot.name}</span>
                <input
                  type="checkbox"
                  checked={enabledBots[bot.id]}
                  onChange={() => toggleBot(bot.id)}
                  disabled={!isAdmin}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <a href="/groups" className="text-blue-400 hover:text-blue-300">
              <ArrowLeft size={20} />
            </a>
            <MessageCircle className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold text-white">{groupName}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-blue-400 transition-colors"
              title="Group Settings"
            >
              <SettingsIcon size={20} />
            </button>
            <div className="flex items-center space-x-2 text-gray-300">
              <User size={16} />
              <span>Demo User</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg relative text-white">
            <button
              onClick={() => { setShowSettings(false); setActiveSection(null); }}
              className="absolute top-2 right-2 text-gray-400 hover:text-red-400"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-white">Group Settings</h2>
            {renderSettingsContent()}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setShowSettings(false); setActiveSection(null); }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : msg.sender === "bot"
                  ? "bg-gray-700 text-white"
                  : "bg-gray-800 text-gray-300"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}; 