
// src/components/chat/MessageList.tsx
import { useState, useEffect, useRef } from 'react'
import { useMessageStore } from '../../store/messageStore'
import { useAuthStore } from '../../store/authStore'
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    List,
    ListItem,
    Divider
} from '@mui/material'

export function MessageList() {
    const [newMessage, setNewMessage] = useState('')
    const { selectedUser, messages, addMessage } = useMessageStore()
    const { session } = useAuthStore()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (newMessage.trim() && selectedUser && session) {
            const message = {
                id: Date.now(),
                sender_id: session?.user_id || -1,
                recipient_id: selectedUser.user_id,
                content: newMessage.trim(),
                timestamp: new Date()
            }

            try {
                await sendMessage(session.token, selectedUser.user_id, newMessage.trim());

                addMessage(message);
                setNewMessage('');
            } catch (error) {
                console.error("Erreur en envoyant le message:", error);
            }
        }
    }

     async function sendMessage(token: string, recipientId: number, content: string) {
        const response = await fetch('/api/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authentication': `Bearer ${token}`
            },
            body: JSON.stringify({ recipientId, content })
        });

         if (!response.ok) {
             let errorMessage = 'Erreur lors de l\'envoi du message';

             try {
                 const err = await response.json();
                 errorMessage = err.message || err.error || errorMessage;
             } catch (e) {
                 errorMessage = `Erreur ${response.status}: ${response.statusText}`;
             }

             throw new Error(errorMessage);
         }

         return response.json();
    }



    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    if (!selectedUser) {
        return (
            <Paper sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">
                    Sélectionnez un utilisateur pour discuter
                </Typography>
            </Paper>
        )
    }

    return (
        <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* En-tête */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                    Discussion avec {selectedUser.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {messages.length} message(s)
                </Typography>
            </Box>

            {/* Zone des messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.length > 0 ? (
                    <List>
                        {messages.map((message) => (
                            <ListItem
                                key={message.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: message.sender_id === session?.user_id ? 'flex-end' : 'flex-start',
                                    px: 1
                                }}
                            >
                                <Box
                                    sx={{
                                        maxWidth: '70%',
                                        bgcolor: message.sender_id === session?.user_id ? 'primary.main' : 'grey.100',
                                        color: message.sender_id === session?.user_id ? 'white' : 'text.primary',
                                        p: 1.5,
                                        borderRadius: 2,
                                        boxShadow: 1
                                    }}
                                >
                                    <Typography variant="body1">
                                        {message.content}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            opacity: 0.7,
                                            display: 'block',
                                            mt: 0.5,
                                            color: message.sender_id === session?.user_id ? 'white' : 'text.secondary'
                                        }}
                                    >
                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Typography>
                                </Box>
                            </ListItem>
                        ))}
                        <div ref={messagesEndRef} />
                    </List>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        flexDirection: 'column'
                    }}>
                        <Typography color="text.secondary" variant="h6" gutterBottom>
                            Aucun message
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                            Envoyez le premier message à {selectedUser.username}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider />

            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Tapez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="small"
                        multiline
                        maxRows={3}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        sx={{ minWidth: 100 }}
                    >
                        Envoyer
                    </Button>
                </Box>
            </Box>
        </Paper>
    )
}