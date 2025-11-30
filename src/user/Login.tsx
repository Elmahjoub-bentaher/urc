
import { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Container
} from "@mui/material";

export function Login() {
    const [loginInput, setLoginInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const navigate = useNavigate();

    const { login, error, isLoading, clearError } = useAuthStore();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearError();

        try {
            await login(loginInput, passwordInput);
            navigate("/dashboard");
        } catch (err) {
            console.error("Login failed:", err);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: '#2196f3'
            }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom>
                        Connexion
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Nom d'utilisateur"
                            value={loginInput}
                            onChange={(e) => setLoginInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Mot de passe"
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isLoading || !loginInput || !passwordInput}
                        >
                            {isLoading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Se connecter"
                            )}
                        </Button>

                        {error && error.message && (
                            <Alert severity="error">
                                {error.message}
                            </Alert>
                        )}
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Link to="/register"  >
                                Pas encore de compte ? S'inscrire
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
