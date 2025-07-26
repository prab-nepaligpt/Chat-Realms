
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { ChatPage } from './pages/ChatPage'
import { GroupsListPage } from './pages/GroupsListPage'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './Components/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/groups" element={<GroupsListPage />} />
            <Route path="/groups/:groupId" element={<ChatPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
