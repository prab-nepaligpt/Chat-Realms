
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ChatPage } from './pages/ChatPage'
import { GroupsListPage } from './pages/GroupsListPage'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/groups" element={<GroupsListPage />} />
          <Route path="/groups/:groupId" element={<ChatPage />} />
          <Route path="*" element={<Navigate to="/groups" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
