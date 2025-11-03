 import { useParams } from "react-router-dom";
 import { useState } from "react";
 import {
   Send,
   LogOut,
   User,
   MessageCircle,
   ArrowLeft,
   Settings as SettingsIcon,
   ChevronLeft,
   Search,
   Paperclip,
   Smile,
   Mic,
   MoreVertical
 } from "lucide-react";

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
  // Mock chats for the left sidebar
  const [chats] = useState([
    { id: 'general', name: `Group ${groupId}`, avatar: 'G', lastMessage: 'Welcome to the group! 👋', time: '12:17' },
    { id: 'alice', name: 'Alice', avatar: 'A', lastMessage: 'See you soon!', time: '11:01' },
    { id: 'bob', name: 'Bob', avatar: 'B', lastMessage: 'Got it 👍', time: 'Yesterday' },
    { id: 'work', name: 'Work Updates', avatar: 'W', lastMessage: 'Standup at 10AM', time: 'Yesterday' },
  ]);
  const [selectedChat, setSelectedChat] = useState('general');
  const [messages, setMessages] = useState([
    { id: 1, text: `Welcome to group ${groupId}! 👋`, sender: "system", timestamp: new Date() },
    { id: 2, text: "Start chatting with your friends!", sender: "bot", timestamp: new Date() }
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
    <div className="h-screen w-full bg-[#f0f2f5] text-gray-900 flex">
      {/* Left Sidebar - Chat list */}
      <aside className="hidden md:flex w-80 flex-col border-r border-gray-200 bg-white">
        {/* Sidebar header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="text-emerald-600" size={22} />
            <span className="font-semibold">Chats</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
            <Search size={16} className="text-gray-500" />
            <input
              placeholder="Search or start new chat"
              className="bg-transparent outline-none text-sm flex-1"
            />
          </div>
        </div>
        {/* Chat items */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedChat(c.id); setGroupName(c.name); }}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 ${selectedChat === c.id ? 'bg-gray-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-700 font-semibold">
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{c.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{c.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{c.lastMessage}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Right Pane - Chat area */}
      <section className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/groups" className="md:hidden text-gray-600 hover:text-gray-800" title="Back">
              <ArrowLeft size={20} />
            </a>
            <div className="w-9 h-9 rounded-full bg-emerald-600/10 flex items-center justify-center text-emerald-700 font-semibold">
              {groupName?.[0] ?? 'G'}
            </div>
            <div>
              <h2 className="font-semibold leading-tight">{groupName}</h2>
              <p className="text-xs text-gray-500">online</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-gray-500">
            <button onClick={() => setShowSettings(true)} className="hover:text-gray-700" title="Group Settings">
              <SettingsIcon size={18} />
            </button>
            <button className="hover:text-gray-700" title="More">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{
            backgroundColor: '#efeae2',
            backgroundImage:
              'radial-gradient(#d1d7db 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`relative max-w-xl px-3 py-2 rounded-lg shadow-sm text-[15px] ${
                    msg.sender === 'user'
                      ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-sm'
                      : msg.sender === 'bot'
                      ? 'bg-white text-gray-900 rounded-tl-sm'
                      : 'bg-white text-gray-600'
                  }`}
                >
                  <p className="leading-snug">{msg.text}</p>
                  <div className="text-[10px] text-gray-500 mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div className="bg-[#f0f2f5] px-4 py-3">
          <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-2">
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <Smile size={20} />
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-700">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none border border-gray-200 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-3 py-2 rounded-full flex items-center justify-center"
              title="Send"
            >
              <Send size={18} />
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-700" title="Voice message">
              <Mic size={20} />
            </button>
          </form>
        </div>
      </section>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg w-full max-w-lg relative">
            <button
              onClick={() => { setShowSettings(false); setActiveSection(null); }}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">Group Settings</h2>
            {renderSettingsContent()}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => { setShowSettings(false); setActiveSection(null); }}
                className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 