// src/components/chat/ConversationList.tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNavigate, useParams } from 'react-router-dom';
import { useMessageStore } from '../../store/messageStore'

import {
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Typography,
    Paper,
    CircularProgress,
    Alert
} from '@mui/material'

interface User {
    user_id: number
    username: string
    last_login: string
}


export function ConversationList() {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const { session } = useAuthStore()
    const { selectUser, selectedUser } = useMessageStore()
    const navigate = useNavigate();
    const { userId } = useParams();

    const handleSelectUser = (user: User) => {
        navigate(`/messages/user/${user.user_id}`);
        selectUser(user);
    }

    useEffect(() => {
        const loadUsers = async () => {
            console.log('Début du chargement des users...')

            if (!session?.token) {
                console.log(' Token manquant, arrêt du chargement')
                setError('Token de session manquant')
                setIsLoading(false)
                return
            }

            try {

                const response = await fetch('/api/users', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication': `Bearer ${session.token}`
                    }
                })

                if (response.ok) {
                    const usersData = await response.json()
                    console.log('Données users reçues:', usersData)
                    console.log("session",session)

                    const filteredUsers = usersData.filter((user: User) =>
                        user.user_id !== session.user_id
                    );

                    setUsers(filteredUsers)
                    console.log('users', users)

                    setError('')
                } else {

                    const errorText = await response.text()
                    console.error(' Erreur HTTP:', {
                        status: response.status,
                        statusText: response.statusText,
                        body: errorText
                    })

                    let errorMessage = `Erreur ${response.status}`
                    try {
                        const errorData = JSON.parse(errorText)
                        errorMessage = errorData.message || errorMessage
                    } catch {
                        errorMessage = errorText || errorMessage
                    }

                    setError(errorMessage)
                    setUsers([])
                }
            } catch (error) {
                console.error('Erreur réseau:', error)
                setError('Erreur de connexion au serveur')
                setUsers([])
            } finally {
                console.log('Chargement terminé')
                setIsLoading(false)
            }
        }

        loadUsers()
    }, [session?.token])


    if (isLoading) {
        return (
            <Paper sx={{ width: 300, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Chargement des utilisateurs...
                    </Typography>
                </Box>
            </Paper>
        )
    }

    return (
        <Paper sx={{ width: 300, height: '100%' }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Utilisateurs
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <List sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 100px)' }}>
                    {users.length > 0 ? (
                        users.map(user => (
                            <ListItem  onClick={() => handleSelectUser(user)} key={user.user_id} disablePadding>
                                <ListItemButton onClick={() => selectUser(user)}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        py: 0.5
                                    }}>
                                        <Typography variant="body1" fontWeight="medium">
                                            {user.username}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {user.last_login}
                                        </Typography>
                                    </Box>
                                </ListItemButton>
                            </ListItem>
                        ))
                    ) : (
                        !error && (
                            <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                                Aucun utilisateur trouvé
                            </Typography>
                        )
                    )}
                </List>
            </Box>
        </Paper>
    )
}