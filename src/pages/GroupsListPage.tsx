import { useNavigate } from "react-router-dom";
import { Plus, Search, Check, ArrowLeft, Send, Smile, Paperclip, Mic, Settings as MoreVertical, Volume2, Stethoscope, Laugh, BookOpen, Clock, Globe, Newspaper } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { groupApi, type GetGroup, authApi, storage } from "../lib/api";

// Groups are fetched from backend; start empty
const initialGroups: GetGroup[] = [];

const testUsers = [
  { id: 'u1', name: 'Sudhir', avatar: '👩‍💻' },
  { id: 'u2', name: 'Aadish', avatar: '👨‍🚀' },
  { id: 'u3', name: 'Amit', avatar: '🧑‍🎨' },
  { id: 'u4', name: 'Ram', avatar: '🦸‍♀️' },
];

// Agent icon mapping
const getAgentIcon = (agentName: string) => {
  const name = agentName.toLowerCase();
  if (name.includes('quag') || name.includes('clown')) return Laugh;
  if (name.includes('doctor')) return Stethoscope;
  if (name.includes('dostoevsky')) return BookOpen;
  if (name.includes('history')) return Clock;
  if (name.includes('cosmo')) return Globe;
  if (name.includes('news') || name.includes('whisperer')) return Newspaper;
  return null;
};

export const GroupsListPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [groups, setGroups] = useState<GetGroup[]>(initialGroups);
  const [showAdd, setShowAdd] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState("💬");
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friendRequests, setFriendRequests] = useState<Record<string, 'sent'>>({});
  const [notification, setNotification] = useState<{ user: { id: string; name: string } | null; timeoutId: NodeJS.Timeout | null }>({ user: null, timeoutId: null });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [message, setMessage] = useState("");
  type ChatMsg = { id: number; text: string; sender: 'user' | 'bot' | 'system'; timestamp: Date; rawSentAt?: string | null; fromName?: string };
  const messagesByGroupRef = useRef<Record<string, ChatMsg[]>>({});
  const [currentMessages, setCurrentMessages] = useState<ChatMsg[]>([]);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const msgIdCounter = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  // WebSocket
  const wsRef = useRef<WebSocket | null>(null);
  const [, setWsConnected] = useState(false);
  const [, setWsError] = useState<string | null>(null);
  const [reconnectTrigger, setReconnectTrigger] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Emoji picker & file upload
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // current username from JWT
  const [myUsername, setMyUsername] = useState<string>("");
  const [showSettings, setShowSettings] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  // Join request modal
  const [showJoin, setShowJoin] = useState(false);
  const [allUsers, setAllUsers] = useState<Array<{ name: string; description: string | null }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [invitingUser, setInvitingUser] = useState<string | null>(null);
  // View members modal
  const [showMembers, setShowMembers] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Array<{ name: string; email: string | null; description: string | null }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  // User info (Me section)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string; description: string | null } | null>(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  // View assigned agents modal
  const [showAssignedAgents, setShowAssignedAgents] = useState(false);
  const [assignedAgents, setAssignedAgents] = useState<Array<{ name: string; description: string | null }>>([]);
  const [assignedAgentsLoading, setAssignedAgentsLoading] = useState(false);
  const [assignedAgentsError, setAssignedAgentsError] = useState<string | null>(null);
  // Chat header menu (three dots)
  const [showChatMenu, setShowChatMenu] = useState(false);
  const chatMenuRef = useRef<HTMLDivElement | null>(null);
  // Track recently sent messages (per group) to avoid double-adding echo
  const recentSentRef = useRef<Record<string, Map<string, number>>>({});
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  // Change password modal
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  // Requests modal (from Chat settings)
  const [showRequests, setShowRequests] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [requests, setRequests] = useState<Array<{ from_name: string; to_name: string; group_name: string }>>([]);
  const [requestActionLoading, setRequestActionLoading] = useState<string | null>(null); // group_name while acting
  // Agents modal
  const [showAgents, setShowAgents] = useState(false);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState<string | null>(null);
  const [agents, setAgents] = useState<Array<{ name: string; description: string | null }>>([]);
  const [assigningAgent, setAssigningAgent] = useState<string | null>(null);
  const [agentSuccess, setAgentSuccess] = useState<string | null>(null);

  // Helper: stable color class per name


  // Helper: extract time from raw timestamp or format Date
  const formatTime = (ts: Date, rawSentAt?: string | null) => {
    if (rawSentAt) {
      // Extract time from "2025-11-02 18:45:08.519355+00:00" → "18:45:08"
      const match = rawSentAt.match(/\d{2}:\d{2}:\d{2}/);
      if (match) return match[0];
    }
    if (!ts || !(ts instanceof Date) || isNaN(ts.getTime())) {
      return '--:--';
    }
    const h = ts.getHours().toString().padStart(2, '0');
    const m = ts.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  // Add group from modal
  const handleAddGroup = async () => {
    const name = newGroupName.trim();
    if (!name) return;
    try {
      await groupApi.addGroup({ name, description: "" });
      // refresh list
      const data = await groupApi.myGroups();
      setGroups(data);
      setShowAdd(false);
      setNewGroupName("");
      setNewGroupAvatar("💬");
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to add group');
    }
  };

  // Update current messages when group changes
  useEffect(() => {
    if (selectedName) {
      const msgs = messagesByGroupRef.current[selectedName] || [];
      setCurrentMessages(msgs);
    } else {
      setCurrentMessages([]);
    }
  }, [selectedName, renderTrigger]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Helper: append message to a group's list
  const addIncomingMessage = (
    groupKey: string,
    msg: { id?: number; text: string; sender: 'user' | 'bot' | 'system'; timestamp: Date; rawSentAt: string | null; fromName?: string }
  ) => {
    // Get current list for this group
    const list = messagesByGroupRef.current[groupKey] ? [...messagesByGroupRef.current[groupKey]] : [];
    
    // Generate id locally
    msgIdCounter.current++;
    const item = { id: msg.id ?? msgIdCounter.current, ...msg };
    console.log('➕ Adding new message | text:', msg.text.substring(0, 30), '| timestamp:', msg.timestamp.toISOString());
    list.push(item);
    
    // Sort chronologically: oldest first, newest last
    list.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    console.log('📊 After sort, first message:', list[0] ? { text: list[0].text.substring(0, 20), time: list[0].timestamp.toISOString() } : 'none');
    console.log('📊 After sort, last message:', list[list.length - 1] ? { text: list[list.length - 1].text.substring(0, 20), time: list[list.length - 1].timestamp.toISOString() } : 'none');
    
    // Update ref
    messagesByGroupRef.current[groupKey] = list;
    
    // If this is the currently selected group, update display immediately
    if (groupKey === selectedName) {
      setCurrentMessages([...list]);
    }
    
    // Force render trigger
    setRenderTrigger(t => t + 1);
  };

  // Load user's groups from backend
  useEffect(() => {
    const load = async () => {
      setLoadingGroups(true);
      setGroupsError(null);
      try {
        const data = await groupApi.myGroups();
        setGroups(data);
      } catch (e) {
        setGroupsError(e instanceof Error ? e.message : 'Failed to load groups');
      } finally {
        setLoadingGroups(false);
      }
    };
    load();
  }, []);

  // Load user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const data = await authApi.getMe();
        setUserInfo(data);
      } catch (e) {
        console.error('Failed to load user info:', e);
      }
    };
    loadUserInfo();
  }, []);

  // Load all users when invite modal opens
  useEffect(() => {
    if (showJoin) {
      const loadUsers = async () => {
        setUsersLoading(true);
        setUsersError(null);
        try {
          const data = await authApi.getUsers();
          setAllUsers(data);
        } catch (e) {
          setUsersError(e instanceof Error ? e.message : 'Failed to load users');
        } finally {
          setUsersLoading(false);
        }
      };
      loadUsers();
    }
  }, [showJoin]);

  // Load group members and assigned agents when a group is selected
  useEffect(() => {
    if (selectedName) {
      const loadMembers = async () => {
        setMembersLoading(true);
        setMembersError(null);
        try {
          const data = await authApi.getGroupMembers(selectedName);
          setGroupMembers(data);
        } catch (e) {
          setMembersError(e instanceof Error ? e.message : 'Failed to load members');
          setGroupMembers([]);
        } finally {
          setMembersLoading(false);
        }
      };
      
      const loadAssignedAgents = async () => {
        setAssignedAgentsLoading(true);
        setAssignedAgentsError(null);
        try {
          const data = await authApi.getAssignedAgents(selectedName);
          setAssignedAgents(data);
        } catch (e) {
          setAssignedAgentsError(e instanceof Error ? e.message : 'Failed to load assigned agents');
          setAssignedAgents([]);
        } finally {
          setAssignedAgentsLoading(false);
        }
      };
      
      loadMembers();
      loadAssignedAgents();
    } else {
      setGroupMembers([]);
      setAssignedAgents([]);
    }
  }, [selectedName]);

  // Connect WebSocket when a group is selected
  useEffect(() => {
    // cleanup any existing socket
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
      setWsConnected(false);
    }
    setWsError(null);

    if (!selectedName) return;

    const base = (import.meta as any).env?.VITE_CHAT_REALMS_BACKEND || (import.meta as any).env?.CHAT_REALMS_BACKEND || "";
    if (!base) return;
    const token = storage.getToken()?.access_token || "";
    const wsBase = base.replace(/^http/i, 'ws');
    const url = `${wsBase}/ws/chat/group/${encodeURIComponent(selectedName)}${token ? `?token=${encodeURIComponent(token)}` : ''}`;

    // Capture the group name at connect time so late events from an old socket
    // don't append into the newly selected group.
    const groupKey = selectedName;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = () => {
      console.log('WebSocket connected to group:', groupKey);
      setWsConnected(true);
      setWsError(null);
    };
    ws.onmessage = (evt) => {
      const raw = typeof evt.data === 'string' ? evt.data : '';
      if (!raw) return;
      console.log('📨 WebSocket received:', raw);
      try {
        const obj = JSON.parse(raw) as { sender?: string; agent_name?: string; message?: string; sent_at?: string };
        const text = obj.message ?? raw;
        // Check if it's an agent message or regular user message
        const senderName = obj.agent_name ? obj.agent_name : (obj.sender ?? '').toString();
        let ts: Date;
        if (obj.sent_at) {
          ts = new Date(obj.sent_at);
        } else if (currentMessages.length > 0) {
          // Use last message's timestamp + 1ms (server time)
          const lastMsgTime = currentMessages[currentMessages.length - 1].timestamp.getTime();
          ts = new Date(lastMsgTime + 1);
        } else {
          ts = new Date();
        }
        const isMe = myUsername && obj.sender && obj.sender.toLowerCase() === myUsername.toLowerCase();
        console.log('📩 Parsed JSON message | group:', groupKey, '| from:', senderName, '| isMe:', isMe, '| text:', text.substring(0, 80));
        // Skip echo of our own optimistic message if same text just sent within 3s
        if (isMe) {
          const now = Date.now();
          if (!recentSentRef.current[groupKey]) recentSentRef.current[groupKey] = new Map();
          const last = recentSentRef.current[groupKey].get(text);
          if (last && now - last < 3000) {
            // consume and remove marker
            recentSentRef.current[groupKey].delete(text);
            return;
          }
        }
        addIncomingMessage(groupKey, {
          text,
          sender: isMe ? 'user' : 'bot',
          timestamp: ts,
          rawSentAt: obj.sent_at ?? null,
          fromName: senderName || undefined,
        });
      } catch (parseError) {
        // fallback to plain text, strip optional `name: message` prefix
        console.log('📝 Parsing as plain text message');
        let sender: 'user' | 'bot' = 'bot';
        let text = raw;
        let fromName: string | undefined = undefined;
        const m = raw.match(/^([^:]{1,64}):\s*(.+)$/);
        if (m) {
          const possibleName = m[1];
          text = m[2];
          if (myUsername && possibleName.toLowerCase() === myUsername.toLowerCase()) {
            sender = 'user';
          }
          fromName = possibleName;
          console.log('📝 Parsed plain text - from:', fromName, '| text:', text.substring(0, 50));
        }
        // Determine if this is our echo and skip if recently sent
        const isMePlain = myUsername && fromName && fromName.toLowerCase() === myUsername.toLowerCase();
        if (isMePlain) {
          const now = Date.now();
          if (!recentSentRef.current[groupKey]) recentSentRef.current[groupKey] = new Map();
          const last = recentSentRef.current[groupKey].get(text);
          if (last && now - last < 3000) {
            recentSentRef.current[groupKey].delete(text);
            return;
          }
        }
        // For plain text messages without server timestamp, use last message time + 1ms
        const existingMsgs = messagesByGroupRef.current[groupKey] || [];
        let timestamp: Date;
        if (existingMsgs.length > 0) {
          timestamp = new Date(existingMsgs[existingMsgs.length - 1].timestamp.getTime() + 1);
        } else {
          timestamp = new Date();
        }
        
        addIncomingMessage(groupKey, {
          text,
          sender,
          timestamp,
          rawSentAt: null,
          fromName: fromName || undefined,
        });
      }
    };
    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setWsError('WebSocket error');
    };
    ws.onclose = (evt) => {
      console.log('WebSocket closed:', evt.code, evt.reason);
      setWsConnected(false);
      // Auto-reconnect after 2 seconds if abnormal closure (1006 = abnormal, no close frame)
      if (evt.code === 1006) {
        console.log('Abnormal closure detected, will reconnect in 2s');
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          setReconnectTrigger(prev => prev + 1);
        }, 2000);
      }
    };

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      try { ws.close(); } catch {}
    };
  }, [selectedName, myUsername, reconnectTrigger]);

  // Close chat header menu on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target as Node)) {
        setShowChatMenu(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Decode JWT username once on mount
  useEffect(() => {
    const t = storage.getToken()?.access_token;
    if (!t) return;
    const parts = t.split('.');
    if (parts.length >= 2) {
      try {
        const json = JSON.parse(atob(parts[1]));
        const name = (json.username || json.user || json.sub || '').toString();
        if (name) setMyUsername(name);
      } catch {
        // ignore
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showMenu]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // even if backend fails, proceed with local logout
    }
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

  const handleGroupClick = (groupId: string, name: string) => {
    setSelectedId(groupId);
    setSelectedName(name);
    // Don't reset messages - let WebSocket populate them
    // This prevents clearing messages if they were already loaded
  };

  const handleSpeak = (text: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const uttr = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(uttr);
      }
    } catch { /* noop */ }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('Recording stopped, blob size:', audioBlob.size);
        alert(`Voice message recorded (${(audioBlob.size / 1024).toFixed(1)}KB). Upload to server not yet implemented.`);
        // TODO: Send audioBlob to server
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    console.log('Attempting to send message, WS state:', wsRef.current?.readyState);

    if (!wsRef.current) {
      alert('WebSocket not initialized. Please select the group again.');
      return;
    }

    if (wsRef.current.readyState !== WebSocket.OPEN) {
      alert(`Not connected to chat (state: ${wsRef.current.readyState}). Please select the group again.`);
      return;
    }

    const toSend = message;
    setMessage("");

    // Optimistic UI: append user's message immediately and mark to skip echo
    if (selectedName) {
      if (!recentSentRef.current[selectedName]) recentSentRef.current[selectedName] = new Map();
      recentSentRef.current[selectedName].set(toSend, Date.now());
      
      // ALWAYS use server's last timestamp + 1ms to avoid timezone conflicts
      const existingMsgs = messagesByGroupRef.current[selectedName] || [];
      let timestamp: Date;
      if (existingMsgs.length > 0) {
        // Use last message's timestamp + 1ms (this is server time, so no timezone issues)
        timestamp = new Date(existingMsgs[existingMsgs.length - 1].timestamp.getTime() + 1);
      } else {
        // No messages yet, use current time
        timestamp = new Date();
      }
      
      addIncomingMessage(selectedName, {
        text: toSend,
        sender: 'user',
        timestamp,
        rawSentAt: null,
        fromName: myUsername || undefined,
      });
    }

    try {
      wsRef.current.send(toSend);
      console.log('Message sent successfully');
    } catch (err) {
      console.error('Failed to send message:', err);
      setWsError('Failed to send message');
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Left Sidebar */}
      <aside className="w-120 bg-gray-800/40 backdrop-blur-xl border-r border-white/10 flex flex-col relative z-10">
        {/* Sidebar header */}
        <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between relative z-[500] bg-gradient-to-r from-emerald-600/20 to-teal-600/20">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight select-none">
              <span className="text-emerald-400">C</span>
              <span className="text-emerald-300">h</span>
              <span className="text-teal-300">a</span>
              <span className="text-teal-200">t</span>
              <span className="text-white">Realms</span>
            </span>
          </div>
          <div className="flex items-center gap-2" ref={menuRef}>
            <button
              onClick={() => setShowUserInfo(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold hover:ring-2 hover:ring-emerald-400 transition-all shadow-lg"
              title="My Profile"
            >
              {userInfo?.name[0]?.toUpperCase() || '?'}
            </button>
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
              title="Menu"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-2 top-14 w-48 bg-gray-900 text-white backdrop-blur-2xl border border-white/30 rounded-xl shadow-2xl py-1 z-[1000] pointer-events-auto">
                <div
                  role="button"
                  onClick={async () => {
                    setShowMenu(false);
                    setShowRequests(true);
                    setRequestsLoading(true);
                    setRequestsError(null);
                    try {
                      const data = await authApi.getRequests();
                      setRequests(data);
                    } catch (e) {
                      setRequestsError(e instanceof Error ? e.message : 'Failed to load invitations');
                    } finally {
                      setRequestsLoading(false);
                    }
                  }}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer focus:outline-none rounded-lg mx-1 transition-all"
                >
                  View invitations
                </div>
                <div
                  role="button"
                  onClick={() => { setShowAdd(true); setShowMenu(false); }}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer focus:outline-none rounded-lg mx-1 transition-all"
                >
                  Add new group
                </div>
                <div
                  role="button"
                  onClick={() => { setShowChangePwd(true); setShowMenu(false); }}
                  className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer focus:outline-none rounded-lg mx-1 transition-all"
                >
                  Change password
                </div>
                <div
                  role="button"
                  onClick={() => { handleLogout(); setShowMenu(false); }}
                  className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer focus:outline-none rounded-lg mx-1 transition-all"
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Search */}
        <div className="p-3">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/10">
            <Search size={16} className="text-gray-400" />
            <input
              placeholder="Search or start new chat"
              className="bg-transparent outline-none text-sm flex-1 text-white placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        {/* Group list */}
        <div className="flex-1 overflow-y-auto">
          {loadingGroups && (
            <div className="px-4 py-3 text-sm text-gray-400">Loading groups...</div>
          )}
          {groupsError && (
            <div className="px-4 py-3 text-sm text-red-400">{groupsError}</div>
          )}
          {!loadingGroups && !groupsError && groups
            .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((g) => {
              const gid = (((g as any).id ?? g.name) + "");
              return (
              <button
                key={gid}
                onClick={() => handleGroupClick(gid, g.name)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/10 border-b border-white/5 transition-all ${selectedId === gid ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-l-4 border-l-emerald-500' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                  {g.name?.[0]?.toUpperCase() ?? 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-white">{g.name}</div>
                  {g.description && <p className="text-xs text-gray-400 truncate mt-0.5">{g.description}</p>}
                </div>
              </button>
              );
            })}
        </div>
      </aside>

      {/* Right Pane - Chat area or placeholder */}
      <section className="flex-1 flex flex-col relative z-10">
        {selectedId ? (
          <>
            {/* Header */}
            <div className="h-16 bg-gray-800/40 backdrop-blur-xl border-b border-white/10 px-4 flex items-center justify-between shadow-lg relative z-[2000] overflow-visible">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setSelectedId(null); setSelectedName(""); }}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                  {selectedName?.[0]?.toUpperCase() ?? 'G'}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedName} <span className="text-xs text-gray-400">({currentMessages.length})</span></h2>
                  <div className="flex items-center gap-2 text-xs">
                    {!membersLoading && groupMembers.length > 0 && (
                      <button
                        onClick={() => setShowMembers(true)}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        {groupMembers.length} {groupMembers.length === 1 ? 'member' : 'members'}
                      </button>
                    )}
                    {membersLoading && (
                      <span className="text-gray-400">Loading...</span>
                    )}
                    {!membersLoading && groupMembers.length === 0 && (
                      <span className="text-gray-400">0 members</span>
                    )}
                    
                    {(!membersLoading && groupMembers.length > 0) && (!assignedAgentsLoading && assignedAgents.length > 0) && (
                      <span className="text-gray-500">•</span>
                    )}
                    
                    {!assignedAgentsLoading && assignedAgents.length > 0 && (
                      <button
                        onClick={() => setShowAssignedAgents(true)}
                        className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                      >
                        {assignedAgents.length} {assignedAgents.length === 1 ? 'agent' : 'agents'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-white/10 rounded-full transition-all" title="Search">
                  <Search size={18} className="text-gray-400 hover:text-white" />
                </button>
                <div className="relative z-[3000] overflow-visible" ref={chatMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowChatMenu(v => !v)}
                    className="p-2 hover:bg-white/10 rounded-full transition-all"
                    title="More options"
                  >
                    <MoreVertical size={18} className="text-gray-400 hover:text-white" />
                  </button>
                  {showChatMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-black text-white border border-white/60 rounded-xl shadow-2xl ring-1 ring-black/70 py-1 z-[9999] pointer-events-auto divide-y divide-white/10">
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-[15px] text-white hover:text-emerald-300 hover:bg-gray-800 font-semibold"
                        onClick={() => {
                          setShowChatMenu(false);
                          setShowJoin(true);
                        }}
                      >
                        Invite to this group
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-[15px] text-white hover:text-emerald-300 hover:bg-gray-800 font-semibold"
                        onClick={async () => {
                          setShowChatMenu(false);
                          setShowMembers(true);
                          setMembersLoading(true);
                          setMembersError(null);
                          try {
                            const data = await authApi.getGroupMembers(selectedName);
                            setGroupMembers(data);
                          } catch (e) {
                            setMembersError(e instanceof Error ? e.message : 'Failed to load members');
                          } finally {
                            setMembersLoading(false);
                          }
                        }}
                      >
                        View members
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-[15px] text-white hover:text-emerald-300 hover:bg-gray-800 font-semibold"
                        onClick={async () => {
                          setShowChatMenu(false);
                          setShowAssignedAgents(true);
                          setAssignedAgentsLoading(true);
                          setAssignedAgentsError(null);
                          try {
                            const data = await authApi.getAssignedAgents(selectedName);
                            setAssignedAgents(data);
                          } catch (e) {
                            setAssignedAgentsError(e instanceof Error ? e.message : 'Failed to load assigned agents');
                          } finally {
                            setAssignedAgentsLoading(false);
                          }
                        }}
                      >
                        View assigned agents
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 text-[15px] text-white hover:text-emerald-300 hover:bg-gray-800 font-semibold"
                        onClick={async () => {
                          setShowChatMenu(false);
                          setShowAgents(true);
                          setAgentsLoading(true);
                          setAgentsError(null);
                          try {
                            const data = await authApi.getAgents();
                            setAgents(data);
                          } catch (e) {
                            setAgentsError(e instanceof Error ? e.message : 'Failed to load agents');
                          } finally {
                            setAgentsLoading(false);
                          }
                        }}
                      >
                        Assign agents
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-4 py-6 bg-gray-900/30 backdrop-blur-sm"
            >
              <div className="space-y-3 flex flex-col">
                {currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex items-start ${msg.sender === 'user' ? 'justify-end ml-16' : 'justify-start mr-16'}`}>
                    {msg.sender !== 'user' && (
                      <div className={`mr-2 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-lg ${
                        msg.fromName && ['Quag', 'Clown', 'Doctor', 'Dostoevsky', 'History', 'Cosmo', 'News', 'Whisperer'].some(agent => msg.fromName?.toLowerCase().includes(agent.toLowerCase()))
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      }`}>
                        {(() => {
                          const AgentIcon = msg.fromName ? getAgentIcon(msg.fromName) : null;
                          return AgentIcon ? <AgentIcon size={16} /> : (msg.fromName?.[0] || '?').toUpperCase();
                        })()}
                      </div>
                    )}
                    <div
                      className={`group relative max-w-md px-4 py-2.5 rounded-2xl shadow-lg text-[15px] backdrop-blur-sm ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm' 
                          : msg.fromName && ['Quag', 'Clown', 'Doctor', 'Dostoevsky', 'History', 'Cosmo', 'News', 'Whisperer'].some(agent => msg.fromName?.toLowerCase().includes(agent.toLowerCase()))
                            ? 'bg-gradient-to-br from-purple-900/80 to-pink-900/80 text-white rounded-tl-sm border border-purple-500/30'
                            : 'bg-gray-800/80 text-white rounded-tl-sm border border-white/10'
                      }`}
                    >
                      {msg.sender !== 'user' && msg.fromName && (
                        <div className="text-[11px] font-medium mb-1">
                          <span className={
                            ['Quag', 'Clown', 'Doctor', 'Dostoevsky', 'History', 'Cosmo', 'News', 'Whisperer'].some(agent => msg.fromName?.toLowerCase().includes(agent.toLowerCase()))
                              ? 'text-purple-300'
                              : 'text-emerald-400'
                          }>{msg.fromName}</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-emerald-100' : 'text-gray-400'}`}>
                        {formatTime(msg.timestamp, msg.rawSentAt)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.text)}
                        className="absolute -bottom-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded backdrop-blur-sm"
                        aria-label="Speak message"
                        title="Speak aloud"
                      >
                        <Volume2 size={12} className="text-gray-300" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Scroll anchor at the very bottom */}
              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Composer */}
            <div className="bg-gray-800/40 backdrop-blur-xl px-4 py-4 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-center gap-6 relative">
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-emerald-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  title="Add emoji"
                >
                  <Smile size={22} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3 z-50">
                    <div className="grid grid-cols-8 gap-2">
                      {['😀','😂','😊','😍','🥰','😎','🤔','😢','😭','😡','👍','👏','🙏','❤️','🔥','✨','🎉','💯','😅','😇','🤗','🤩','😋','😜','🥳','🤪','😴','🤐'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setMessage(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-xl hover:bg-white/10 rounded p-1 transition-all"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <input 
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      alert(`File selected: ${file.name}. File upload to server not yet implemented.`);
                      // TODO: Implement file upload to server
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-400 hover:text-emerald-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                  title="Attach file"
                >
                  <Paperclip size={22} />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 text-sm outline-none border border-white/10 focus:border-emerald-500 text-white placeholder-gray-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-4 py-3 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  title="Send"
                >
                  <Send size={18} />
                </button>
                <button 
                  type="button" 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-full transition-all ${isRecording ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-gray-400 hover:text-emerald-400 hover:bg-white/10'}`}
                  title={isRecording ? 'Stop recording' : 'Record voice message'}
                >
                  <Mic size={22} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center max-w-md px-6">
              <img
                src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4ac.svg"
                alt="Chat"
                className="w-28 h-28 mx-auto opacity-70"
              />
              <h2 className="mt-6 text-2xl font-semibold">ChatRealms Web</h2>
              <p className="mt-2 text-sm text-gray-600">
                Enjoy Talking with friends and groups feeling the presence of you multiple personality AI friend always with you
              </p>
              <div className="mt-6 text-xs text-gray-500">Your messages are end-to-end encrypted.</div>
            </div>
          </div>
        )}
      </section>

      {/* Add Group Modal/Form */}
      {/* Invite User To Group Modal */}
      {showJoin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowJoin(false)}>
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Invite User to {selectedName || 'Group'}</h2>
            {joinError && (
              <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded text-sm">{joinError}</div>
            )}
            {usersLoading && <div className="text-sm text-gray-300">Loading users...</div>}
            {usersError && <div className="text-sm text-red-400 mb-3">{usersError}</div>}
            {!usersLoading && !usersError && (
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {allUsers.length === 0 ? (
                  <div className="text-sm text-gray-400">No users available.</div>
                ) : (
                  allUsers.map((user) => (
                    <div key={user.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-white">{user.name}</div>
                        {user.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{user.description}</div>
                        )}
                      </div>
                      <button
                        disabled={invitingUser === user.name}
                        onClick={async () => {
                          try {
                            setInvitingUser(user.name);
                            setJoinError(null);
                            await groupApi.sendJoinRequest({ to_name: user.name, group_name: selectedName });
                            setJoinSuccess(`Invitation sent to ${user.name}`);
                            setTimeout(() => setJoinSuccess(null), 3000);
                          } catch (e) {
                            setJoinError(e instanceof Error ? e.message : 'Failed to send invitation');
                          } finally {
                            setInvitingUser(null);
                          }
                        }}
                        className="ml-3 px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50 transition-all"
                      >
                        {invitingUser === user.name ? 'Inviting...' : 'Invite'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowJoin(false)} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white">Close</button>
            </div>
          </div>
        </div>
      )}

      {joinSuccess && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 text-gray-900 py-2 px-4 rounded-lg shadow-lg z-[60]">
          {joinSuccess}
        </div>
      )}

      {/* User Info Modal (Me) */}
      {showUserInfo && userInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowUserInfo(false)}>
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-6">My Profile</h2>
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                {userInfo.name[0]?.toUpperCase() || '?'}
              </div>
              <h3 className="text-xl font-semibold text-white">{userInfo.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{userInfo.email}</p>
            </div>
            {userInfo.description && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">About</h4>
                <p className="text-sm text-white">{userInfo.description}</p>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowUserInfo(false)} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Assigned Agents Modal */}
      {showAssignedAgents && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAssignedAgents(false)}>
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Assigned Agents in {selectedName || 'Group'}</h2>
            {assignedAgentsLoading && <div className="text-sm text-gray-300">Loading agents...</div>}
            {assignedAgentsError && <div className="text-sm text-red-400 mb-3">{assignedAgentsError}</div>}
            {!assignedAgentsLoading && !assignedAgentsError && (
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {(!assignedAgents || assignedAgents.length === 0) ? (
                  <div className="text-sm text-gray-400">No agents assigned to this group.</div>
                ) : (
                  (assignedAgents || []).map((agent) => {
                    const AgentIcon = getAgentIcon(agent.name);
                    return (
                      <div key={agent.name} className="flex items-center p-3 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-lg border border-purple-500/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold mr-3 shadow-lg">
                          {AgentIcon ? <AgentIcon size={20} /> : agent.name[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-purple-300">{agent.name}</div>
                          {agent.description && (
                            <div className="text-xs text-gray-400">{agent.description}</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowAssignedAgents(false)} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View Members Modal */}
      {showMembers && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowMembers(false)}>
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Members of {selectedName || 'Group'}</h2>
            {membersLoading && <div className="text-sm text-gray-300">Loading members...</div>}
            {membersError && <div className="text-sm text-red-400 mb-3">{membersError}</div>}
            {!membersLoading && !membersError && (
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {groupMembers.length === 0 ? (
                  <div className="text-sm text-gray-400">No members in this group.</div>
                ) : (
                  groupMembers.map((member) => (
                    <div key={member.name} className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold mr-3">
                        {member.name[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{member.name}</div>
                        {member.email && (
                          <div className="text-xs text-gray-400 mt-0.5">{member.email}</div>
                        )}
                        {member.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{member.description}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowMembers(false)} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white">Close</button>
            </div>
          </div>
        </div>
      )}
      {/* Chat Settings Modal (extended) */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowSettings(false)}>
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500"
              title="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-3">Chat Settings</h3>
            <ul className="space-y-2 text-sm">
              <li className="p-2 rounded cursor-pointer text-gray-700 hover:text-gray-900">Mute notifications</li>
              <li className="p-2 rounded cursor-pointer text-gray-700 hover:text-gray-900">Star messages</li>
              <li className="p-2 rounded cursor-pointer text-gray-700 hover:text-gray-900">Clear messages</li>
              <li
                className="p-2 rounded cursor-pointer text-gray-700 hover:text-gray-900"
                onClick={async () => {
                  setShowSettings(false);
                  setShowAgents(true);
                  setAgentsLoading(true);
                  setAgentsError(null);
                  try {
                    const data = await authApi.getAgents();
                    setAgents(data);
                  } catch (e) {
                    setAgentsError(e instanceof Error ? e.message : 'Failed to load agents');
                  } finally {
                    setAgentsLoading(false);
                  }
                }}
              >
                View agents
              </li>
              <li
                className="p-2 rounded cursor-pointer text-gray-700 hover:text-gray-900"
                onClick={() => {
                  setShowSettings(false);
                  setShowJoin(true);
                }}
              >
                Invite to group
              </li>
            </ul>
            <div className="mt-4 text-right">
              <button onClick={() => setShowSettings(false)} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">Done</button>
            </div>
          </div>
        </div>
      )}
      {/* Change Password Modal */}
      {showChangePwd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowChangePwd(false)}>
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Change Password</h2>
            {pwdError && (
              <div className="mb-3 p-2 bg-red-500/20 border border-red-500/50 text-red-300 rounded">{pwdError}</div>
            )}
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1 text-gray-300">Current password</label>
                <input
                  type="password"
                  value={curPwd}
                  onChange={(e) => setCurPwd(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-300">New password</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setShowChangePwd(false)} className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white">Cancel</button>
              <button
                disabled={pwdLoading || !curPwd.trim() || !newPwd.trim()}
                onClick={async () => {
                  try {
                    setPwdError(null);
                    setPwdLoading(true);
                    await authApi.changePassword({ current_password: curPwd.trim(), new_password: newPwd.trim() });
                    setShowChangePwd(false);
                    setCurPwd("");
                    setNewPwd("");
                    setPwdSuccess("Password changed successfully");
                    setTimeout(() => setPwdSuccess(null), 3000);
                  } catch (e) {
                    setPwdError(e instanceof Error ? e.message : 'Failed to change password');
                  } finally {
                    setPwdLoading(false);
                  }
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50"
              >
                {pwdLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pwdSuccess && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 text-gray-900 py-2 px-4 rounded-lg shadow-lg z-[60]">
          {pwdSuccess}
        </div>
      )}

      {/* Agents Modal */}
      {showAgents && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowAgents(false)}>
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Agents</h2>
              <button onClick={() => setShowAgents(false)} className="text-gray-400 hover:text-red-400 text-2xl">×</button>
            </div>
            {agentsLoading && <div className="text-sm text-gray-300">Loading...</div>}
            {agentsError && <div className="text-sm text-red-400">{agentsError}</div>}
            {!agentsLoading && !agentsError && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {agents.length === 0 ? (
                  <div className="text-sm text-gray-400">No agents available.</div>
                ) : (
                  agents.map((a) => (
                    <div key={a.name} className="border border-white/20 bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{a.name}</div>
                          <div className="text-xs text-gray-400">{a.description ?? 'No description'}</div>
                        </div>
                        <button
                          disabled={assigningAgent === a.name || !selectedName}
                          onClick={async () => {
                            if (!selectedName) return;
                            try {
                              setAssigningAgent(a.name);
                              await authApi.assignAgentToGroup({ agent_name: a.name, group_name: selectedName });
                              setAgentSuccess(`Assigned ${a.name} to ${selectedName}`);
                              setTimeout(() => setAgentSuccess(null), 3000);
                            } catch (e) {
                              alert(e instanceof Error ? e.message : 'Failed to assign agent');
                            } finally {
                              setAssigningAgent(null);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50"
                        >
                          {assigningAgent === a.name ? 'Adding…' : 'Add to group'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {agentSuccess && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 text-gray-900 py-2 px-4 rounded-lg shadow-lg z-[60]">
          {agentSuccess}
        </div>
      )}

      {/* Invitations Modal */}
      {showRequests && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowRequests(false)}>
          <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Invitations</h2>
              <button onClick={() => setShowRequests(false)} className="text-gray-400 hover:text-red-400 text-2xl">×</button>
            </div>
            {requestsLoading && <div className="text-sm text-gray-300">Loading...</div>}
            {requestsError && <div className="text-sm text-red-400">{requestsError}</div>}
            {!requestsLoading && !requestsError && (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {requests.length === 0 ? (
                  <div className="text-sm text-gray-400">No pending invitations.</div>
                ) : (
                  requests.map((r) => (
                    <div key={`${r.from_name}-${r.group_name}`} className="border border-white/20 bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-white">{r.from_name}</div>
                        <div className="text-xs text-gray-400">invited you to join {r.group_name}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={requestActionLoading === r.group_name}
                          onClick={async () => {
                            try {
                              setRequestActionLoading(r.group_name);
                              await authApi.respondToRequest({ group_name: r.group_name, response: true });
                              setRequests((prev) => prev.filter((x) => !(x.group_name === r.group_name && x.from_name === r.from_name)));
                            } catch (e) {
                              alert(e instanceof Error ? e.message : 'Failed to accept');
                            } finally {
                              setRequestActionLoading(null);
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          disabled={requestActionLoading === r.group_name}
                          onClick={async () => {
                            try {
                              setRequestActionLoading(r.group_name);
                              await authApi.respondToRequest({ group_name: r.group_name, response: false });
                              setRequests((prev) => prev.filter((x) => !(x.group_name === r.group_name && x.from_name === r.from_name)));
                            } catch (e) {
                              alert(e instanceof Error ? e.message : 'Failed to reject');
                            } finally {
                              setRequestActionLoading(null);
                            }
                          }}
                          className="px-3 py-1 rounded-lg border border-white/30 hover:bg-white/10 text-white"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
        {showAdd && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-900/95 backdrop-blur-2xl border border-white/20 text-white p-6 rounded-xl shadow-2xl w-full max-w-sm">
              <h2 className="text-xl font-bold mb-4">Create New Group</h2>
              <div className="mb-4">
                <label className="block text-sm mb-1 text-gray-300">Group Name</label>
                <input
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  maxLength={32}
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm mb-1 text-gray-300">Description</label>
                <input
                  className="w-full p-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white placeholder-gray-400"
                  value={newGroupAvatar}
                  onChange={e => setNewGroupAvatar(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-white/20 hover:bg-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGroup}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 font-semibold disabled:from-gray-600 disabled:to-gray-600 disabled:opacity-50"
                  disabled={!newGroupName.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}


      {/* Add Friend Modal */}
      {showAddFriend && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddFriend(false)}>
          <div className="bg-white text-gray-900 p-6 rounded-xl shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Find Friends</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by username..."
                className="w-full p-2 pl-10 rounded border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testUsers
                .filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(user => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
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
                        <Check size={20} className="text-emerald-600" />
                      ) : (
                        <Plus size={20} className="text-emerald-600 hover:text-emerald-700" />
                      )}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {notification.user && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white border border-gray-200 text-gray-900 py-2 px-4 rounded-lg shadow-lg flex items-center space-x-4 animate-fade-in-up z-[60]">
          <span>Friend request sent to <strong>{notification.user.name}</strong></span>
          <button
            onClick={() => handleUndoRequest(notification.user!.id)}
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Undo
          </button>
        </div>
      )}
      
    </div>
  );
};
 