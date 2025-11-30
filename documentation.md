# Documentation du Projet

## 0. Rôle de l'Intelligence Artificielle dans le projet
L'utilisation de l'IA (type LLM) a été strictement encadrée pour servir de **mentor technique** et non de générateur de solutions.

* **Ce que l'IA a fait :**
    * Explication de concepts théoriques (Gestion d'état global, persistance, cycle de vie React).
    * Proposition des bonnes pratiques juste pour s'inspirer toujours gardant l'aspect critiaue".
* **Ce que l'IA n'a PAS fait :**
    * Génération automatique de code (Copilot, etc.).
    * Débogage à la place du développeur.



## 1. Architecture des Données : Pourquoi ces Stores ?

Dans une application React standard, passer les données de parent à enfant (via les `props`) devient vite complexe quand l'application grandit. C'est pourquoi j'ai choisi **Zustand** pour créer une "Source de Vérité" globale.

Voici l'explication détaillée de mes deux magasins de données (Stores).


### 1.1. Le Store d'Authentification (authStore.ts)

#### Pourquoi ce store ?
C'est la carte d'identité de l'application. Son rôle est unique : savoir **"Qui est connecté ?"** et **"Est-ce qu'il a le droit d'être là ?"**.
Sans ce store, je devrais passer le token de connexion à absolument tous les composants de l'application manuellement.

#### Son fonctionnement
Il gère trois états cruciaux :
1. **user** : Les infos de la personne connectée (mon ID, mon pseudo).
2. **session** : La preuve technique de la connexion (le Token JWT).
3. **isAuthenticated** : Un simple "Oui/Non" pour savoir si on affiche l'écran de Login ou le Chat.

#### Où et pourquoi je l'ai utilisé ?

| Composant | Utilisation | Pourquoi ? |
| :--- | :--- | :--- |
| **Login.tsx** | Action `login()` | C'est le point d'entrée. Le composant récupère les infos saisies et demande au Store de valider l'identité auprès du serveur. |
| **ConversationList.tsx** | État `session.token` | Pour charger la liste des utilisateurs, l'API exige une preuve d'identité (le token). Le composant le poche directement dans le store. |
| **MessageList.tsx** | État `user.user_id` | Pour l'affichage : "Est-ce que ce message vient de MOI (bleu) ou de LUI (gris) ?". On compare l'ID du message avec l'ID du store. |



### 1.2. Le Store de Messagerie (messageStore.ts)

#### Pourquoi ce store ?
C'est le cerveau de la conversation. React "oublie" tout quand on change de page. Si je clique sur "Utilisateur B" puis que je reviens sur "Utilisateur A", je ne veux pas recharger tous les messages depuis le serveur.
Ce store sert de **cache** et de **gestionnaire de navigation** entre les discussions.

#### Son fonctionnement
Il utilise une structure de données optimisée pour organiser les messages :
* Il ne stocke pas une simple liste, mais un **Dictionnaire** (Objet) :
    * `conversations: { [userID]: [Message, Message...] }`
* Cela permet de retrouver instantanément l'historique de Paul, Jacques ou Marie sans devoir trier tout un tableau à chaque fois.

#### Où et pourquoi je l'ai utilisé ?

| Composant | Utilisation | Pourquoi ? |
| :--- | :--- | :--- |
| **ConversationList.tsx** | Action `selectUser()` | Quand je clique sur un nom, ce composant dit au Store : "On change de chaîne, affiche-moi les messages de cet utilisateur". |
| **MessageList.tsx** | État `messages` | Ce composant est "bête" : il se contente d'afficher la liste que le Store lui donne. Il ne gère pas la logique de tri. |
| **MessageList.tsx** | Action `addMessage()` | Quand j'envoie un message, je l'ajoute immédiatement au store pour que l'interface soit réactive, sans attendre la réponse lente du serveur. |


## 2. Limites Actuelles et Perspectives : Le Temps Réel

Je me suis arrêté dans le développement avant l'implémentation de la synchronisation en temps réel. Cette section détaille l'état actuel du projet.

### État actuel : Le modèle HTTP standard
À ce stade, l'application fonctionne exclusivement sur des requêtes HTTP classiques (GET et POST).

* **Ce qui fonctionne :** L'envoi de message est fluide pour l'expéditeur grâce à la mise à jour locale du store (Optimistic UI). Je vois mon message s'afficher instantanément.
* **Ce qui manque :** La réception automatique. Si mon interlocuteur m'envoie un message pendant que je regarde l'écran, rien ne s'affiche.
* **Solution de contournement actuelle :** Pour voir les nouveaux messages reçus, l'utilisateur doit rafraîchir la page ou cliquer à nouveau sur la conversation pour relancer un chargement des données.


